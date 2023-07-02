# How `median.bin` (also `mmah-vite/public/graphics.json`) is generated form `graphics.txt`

- extract `medians: [...]`
- flip y (HTML canvas y+ is down, but in graphics.txt y+ is up)
- move the bounding box into `[0, 256)` for both x and y
- sample 5 points for each strokes
- flatten strokes (`[[x0,y0],[x1,y1]]` -> `[x0,y0,x1,y1]`)

