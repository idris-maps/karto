curl https://unpkg.com/visionscarto-world-atlas@0.0.6/world/110m_countries.geojson \
  | npx ndjson-cat \
  | npx ndjson-split "d.features" \
  | npx ndjson-filter "d.properties.continent === 'Africa'" \
  | npx ndjson-reduce > countries.json