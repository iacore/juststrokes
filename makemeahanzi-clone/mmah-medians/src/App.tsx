import { createEffect, createRenderEffect, createSignal, onMount } from 'solid-js'
// import solidLogo from './assets/solid.svg'
import './App.css'
import { Matcher, Stroke } from './makemeahanzi-decoded'

import medians_url from './graphics.json?url'


function App() {
  let canvas: HTMLCanvasElement = undefined!

  const [strokes, setStrokes] = createSignal<Stroke[]>([])
  const [matcher, setMatcher] = createSignal<Matcher>()
  const [candidates, setCandidates] = createSignal<string[]>([])

  onMount(async () => {
    let ispointerdown = false
    canvas.addEventListener("pointerdown", () => {
      ispointerdown = true
      let ss = strokes()
      setStrokes([...ss, []])
    })
    canvas.addEventListener("pointerup", () => {
      ispointerdown = false
    })
    canvas.addEventListener("pointermove", (evt) => {
      if (!ispointerdown) return
      let ss = [...strokes()]
      if (ss.length >= 1) {
        console.log(evt)
        ss[ss.length - 1].push([evt.offsetX, evt.offsetY])
      }
      setStrokes(ss)
    })
    createRenderEffect(() => {
      const _strokes = strokes()
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "white"
      ctx.clearRect(0, 0, canvas.width, canvas.height)
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

    const medians = await (await fetch(medians_url)).json()
    setMatcher(new Matcher(medians, {}))
  })

  createEffect(() => {
    const _matcher = matcher()
    if (_matcher) {
      setCandidates(_matcher.match(strokes(), 10))
    }
  })

  function tryMatch() {
    const _matcher = matcher()
    if (_matcher) {
      setCandidates(_matcher.match(strokes().map(o => o.map(p => [p[0] / 400, p[1] / 400])), 1))
    }
  }

  return (
    <div class="App">
      <canvas width="400" height="400" ref={canvas} />
      <div>
        <button onClick={() => setStrokes([])}>Clear</button>
        <button onClick={tryMatch}>Match</button>
      </div>
      <p>
        #strokes: {strokes().length}
        <br />
      </p>
      points:
      {strokes().map(x => <code>{x.length} {JSON.stringify(x)} </code> )}
      <ul>
        {candidates().map((x) => <li>{x}</li>)}
      </ul>
    </div>
  )
}

export default App
