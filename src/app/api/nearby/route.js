import { NextResponse } from "next/server";

const CATEGORY_QUERIES = {
  all: `node(around:{radius},{lat},{lng})[name][~"^(amenity|tourism|leisure|shop)$"~"."];`,
  restaurant: `node(around:{radius},{lat},{lng})[amenity~"restaurant|fast_food|food_court"][name];`,
  cafe: `node(around:{radius},{lat},{lng})[amenity=cafe][name];`,
  tourism: `node(around:{radius},{lat},{lng})[tourism~"attraction|museum|monument|viewpoint|theme_park|zoo|gallery"][name];`,
  park: `node(around:{radius},{lat},{lng})[leisure~"park|garden|nature_reserve"][name];
          way(around:{radius},{lat},{lng})[leisure~"park|garden"][name];`,
  hotel: `node(around:{radius},{lat},{lng})[tourism~"hotel|hostel|guest_house|motel"][name];`,
  hospital: `node(around:{radius},{lat},{lng})[amenity~"hospital|clinic|doctors|pharmacy"][name];`,
  fuel: `node(around:{radius},{lat},{lng})[amenity=fuel][name];`,
};

function buildQuery(category, lat, lng, radius) {
  const template = CATEGORY_QUERIES[category] || CATEGORY_QUERIES.all;
  const processedTemplate = template
    .replaceAll("{radius}", radius)
    .replaceAll("{lat}", lat)
    .replaceAll("{lng}", lng);

  return `[out:json][timeout:25];(${processedTemplate});out body 60;>;out skel qt;`;
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = R * c;
  return meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;
}

function getPlaceType(tags) {
  return (
    tags.amenity ||
    tags.tourism ||
    tags.leisure ||
    tags.shop ||
    tags.healthcare ||
    "place"
  );
}

export async function POST(request) {
  try {
    const { lat, lng, category = "all", radius = 5000 } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: "Coordinates required." }, { status: 400 });
    }

    const query = buildQuery(category, lat, lng, radius);
    
    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter"
    ];

    let response;
    let success = false;

    for (const url of endpoints) {
      try {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
          next: { revalidate: 3600 } 
        });

        if (response.ok) {
          success = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!success) {
      return NextResponse.json({ error: "All Overpass mirrors are down or rate-limited." }, { status: 503 });
    }

    const data = await response.json();

    const places = (data.elements || [])
      .filter((el) => el.tags?.name && (el.lat || (el.center && el.center.lat)))
      .map((el) => {
        const latitude = el.lat || el.center.lat;
        const longitude = el.lon || el.center.lon;
        return {
          id: el.id,
          name: el.tags.name,
          type: getPlaceType(el.tags).replace(/_/g, " "),
          lat: latitude,
          lng: longitude,
          distance: getDistance(lat, lng, latitude, longitude),
          address: [el.tags["addr:street"], el.tags["addr:city"]]
            .filter(Boolean)
            .join(", ") || null,
          opening_hours: el.tags.opening_hours
            ? el.tags.opening_hours.includes("24/7")
              ? "Open"
              : "Check hours"
            : null,
          website: el.tags.website || null,
          phone: el.tags.phone || el.tags["contact:phone"] || null,
        };
      })
      .sort((a, b) => {
        const parse = (d) => parseFloat(d.replace("km", "000").replace("m", ""));
        return parse(a.distance) - parse(b.distance);
      })
      .slice(0, 50);

    return NextResponse.json({ places });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}