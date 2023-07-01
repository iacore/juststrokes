import json

output = []
for line in open("graphics.txt"):
    o = json.loads(line)
    output.append([o["character"], o["medians"]])

json.dump(output, open("graphics.json", "w"))