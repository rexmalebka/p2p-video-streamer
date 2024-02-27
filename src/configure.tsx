import { useNavigate } from 'react-router-dom'
import Peer, { MediaConnection } from 'peerjs'
import { useCallback, useRef } from 'react'


const Configure = ({ peer, change_configuration }: {
    peer: Peer, change_configuration: (host: string, port: number, path: string) => void
}) => {
    const navigate = useNavigate()

    const data_form = useRef<HTMLFormElement>(null)

    const save_config = useCallback(() => {
        if (!data_form.current) return

        const form_data = new FormData(data_form.current)

        const host_data = form_data.get('host') as string || ''
        const port_data = Number(form_data.get('port') as string) || 443
        const path_data = form_data.get('path') as string || ''

        change_configuration(host_data, port_data, path_data)
    }, [data_form, peer])

    return (
        peer ?
            (
                <>
                    <div>
                        <div>
                            <button onClick={save_config}>💾 save</button>
                        </div>
                        <div>
                            <button onClick={() => navigate('/')}>back</button>
                        </div>
                    </div>
                    <form ref={data_form}>
                        <div>
                            <label htmlFor="host">Host</label>
                            <input name="host" type="text" defaultValue={peer.options.host} />
                        </div>
                        <div>
                            <label htmlFor="port">port</label>
                            <input name="port" type="number" defaultValue={peer.options.port} />
                        </div>
                        <div>
                            <label htmlFor="path">path</label>
                            <input name="path" type="text" defaultValue={peer.options.path} />
                        </div>
                    </form>
                </>
            ) : null
    )
}


export default Configure