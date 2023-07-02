
# How `median.bin` is generated form `graphics.txt`

- extract `medians: [...]`
- flip y (HTML canvas y+ is down, but in graphics.txt y+ is up)
- flatten strokes (`[[x0,y0],[x1,y1]]` -> `[x0,y0,x1,y1]`)

