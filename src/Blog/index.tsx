import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import TopBar from './TopBar'

export { default as ViewPost } from './ViewPost'
export { default as NewPost } from './NewPost'
export { default as Profile } from './Profile'
export { default as TopBar } from './TopBar'
export { default as ViewPostList } from './Blog'
export { default as UserProfile } from './UserProfile'

export type Post = {
   slug: string
   user: string
   content: string
}

const StyledBlogWrapper = styled.div`
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

export const BlogWrapper = () => {
   return (
      <>
         <TopBar />

         <StyledBlogWrapper className="styled-blog">
            <Outlet />
         </StyledBlogWrapper>
      </>
   )
}
