import { createEffect, createRenderEffect, createSignal, onMount } from 'solid-js'
// import solidLogo from './assets/solid.svg'
import './App.css'
import { Matcher, Stroke } from './makemeahanzi-decoded'

import medians_url from './graphics.json?url'

function App() {
  let el_canvas: HTMLCanvasElement = undefined!
  let el_staging: HTMLInputElement = undefined!

  const [strokes, setStrokes] = createSignal<Stroke[]>([])
  const [matcher, setMatcher] = createSignal<Matcher>()
  const [candidates, setCandidates] = createSignal<string[]>([])

  onMount(async () => {
    let ispointerdown = false
    const onPointerDown = (evt: PointerEvent) => {
      ispointerdown = true
      let ss = strokes()
      setStrokes([...ss, []])
      onPointerMove(evt)
    }
    el_canvas.addEventListener("pointerdown", onPointerDown)
    const onPointerUp = (evt: PointerEvent) => {
      onPointerMove(evt)
      ispointerdown = false
    }
    el_canvas.addEventListener("pointerup", onPointerUp)
    const onPointerMove = (evt: PointerEvent): void => {
      if (!ispointerdown) return
      let ss = [...strokes()]
      if (ss.length >= 1) {
        console.log(evt)
        ss[ss.length - 1].push([evt.offsetX, evt.offsetY])
      }
      setStrokes(ss)
    }
    el_canvas.addEventListener("pointermove", onPointerDown)
    
    createRenderEffect(() => {
      const _strokes = strokes()
      const ctx = el_canvas.getContext("2d")!
      ctx.fillStyle = "white"
      ctx.clearRect(0, 0, el_canvas.width, el_canvas.height)
      ctx.fillStyle = "none"
      ctx.strokeStyle = "black"
      ctx.lineWidth = 2
      for (const stroke of _strokes) {
        ctx.beginPath()
        if (stroke.length >= 1) {
          ctx.moveTo(stroke[0][0], stroke[0][1])
        }
        for (const point of stroke) {
          ctx.lineTo(point[0], point[1])
        }
        ctx.stroke()
      }
    })
  })

  createEffect(async () => {
    const medians = await (await fetch(medians_url)).json()
    setMatcher(new Matcher(medians, {}))
  })

  createEffect(() => {
    const _matcher = matcher()
    if (_matcher) {
      setCandidates(_matcher.match(strokes(), 20))
    }
  })

  return (
    <div class="App">
      <canvas width="512" height="512" ref={el_canvas} />
      <div>
        <button onClick={() => setStrokes([])}>Clear</button>
      </div>
      <details>
        <summary>Debug</summary>
        <p>strokes: {strokes().length}</p>
        <ul>
          {strokes().map(x => <li>
            {x.length} <code>{JSON.stringify(x)}</code>
          </li>)}
        </ul>
      </details>
      <div class="candidates">
        {candidates().map((x) => <button onClick={() => {
          el_staging.value += x
        }}>{x}</button>)}
      </div>
      <input type="text" placeholder="copy area" ref={el_staging}/>
    </div>
  )
}

export default App
