import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

const NodesLanding = () => {
    useEffect(() => {
        document.title = 'Nodes'
    }, [])

    return (
        <div style={{ padding: '1rem' }}>
            <Outlet />
        </div>
    )
}

export default NodesLanding
