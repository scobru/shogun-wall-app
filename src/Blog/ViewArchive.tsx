import { DungeonNode } from 'Nodes'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import useListen from '../api/useListen'
import { createMarkup } from '../utils'

const PostStyled = styled.div`
   max-width: 520px;
   overflow-wrap: break-word;
`

const ViewPostList = () => {
   const posts = useListen(undefined, 'archive', false) as DungeonNode[]

   return (
      <div>
         <Helmet>
            <title>Archive</title>
         </Helmet>
         {posts.map((post) => (
            <PostStyled
               key={post.key}
               dangerouslySetInnerHTML={createMarkup(post.content)}
            />
         ))}
      </div>
   )
}

export default ViewPostList
