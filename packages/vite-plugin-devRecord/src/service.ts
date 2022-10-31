// import mitt from "mitt"

// export const emitter = mitt()

export function register(event: { key: string, label: string, handler: (data: any) => any }) {
    let btn = document.createElement("button")
    btn.classList.add('vite-plugin-devrecord')
    btn.classList.add(event.key)
    btn.innerText = event.label

    let data = {}

    async function btnFn(e: MouseEvent) {
        let ret = event.handler(data)
        if (ret) {
            const response = await fetch('/VITE_PLUGIN_DEVRECORD', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type: event.key, data: ret })
            })
            if (!response.ok) {
                console.error(`fail to send event --${event.key} to devServer `)
            }
        }
        e.preventDefault()
        e.stopPropagation()
    }
    btn.addEventListener("click", btnFn, true)
    document.querySelector('#vite-plugin-devrecord')?.appendChild(btn)
}