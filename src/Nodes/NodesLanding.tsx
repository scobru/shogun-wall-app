import { useEffect } from 'react'

const NodesLanding = () => {
    useEffect(() => {
        document.title = 'List Nodes'
    }, [])

    return (
        <>
            <h3>Nodes Landing Page</h3>
        </>
    )
}

export default NodesLanding
