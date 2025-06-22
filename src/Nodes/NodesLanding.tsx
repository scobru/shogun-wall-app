import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from '../Blog'
import styled from 'styled-components'

const StyledNodesWrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   min-height: calc(100vh - 64px); /* Sottrae l'altezza del TopBar */
   padding: 1rem;
   background: var(--background);
   
   @media only screen and (min-width: 600px) {
      padding: 1.5rem 2rem 2rem 2rem;
   }
`

const NodesLanding = () => {
    useEffect(() => {
        document.title = 'Nodes'
    }, [])

    return (
        <>
            <TopBar />
            <StyledNodesWrapper className="styled-nodes">
                <Outlet />
            </StyledNodesWrapper>
        </>
    )
}

export default NodesLanding
