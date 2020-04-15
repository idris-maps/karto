curl https://gist.githubusercontent.com/tdreyno/4278655/raw/7b0762c09b519f40397e4c3e100b097d861f5588/airports.json \
  | npx ndjson-cat \
  | npx ndjson-split \
  | npx ndjson-filter "d.type === 'Airports'" \
  | npx ndjson-filter "d.country === 'Switzerland'" \
  | npx ndjson-map "{ type: 'Point', coordinates: [Number(d.lon), Number(d.lat)] }" \
  | npx ndjson-reduce > src/airports.json
