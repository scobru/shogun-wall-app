import {
   BrowserRouter,
   Outlet,
   Routes,
   Route,
   Navigate,
   useNavigate
} from 'react-router-dom'
import { ViewNode, NewNode, NodesLanding } from './Nodes'
import { GetAll } from './List'
import { NewPost, ViewPost, ViewPostList, BlogWrapper, Profile, UserPosts, UserProfile } from './Blog'
import ViewArchive from './Blog/ViewArchive'
import EditPost from './Blog/EditPost'
import Dashboard from './Nodes/Dashboard'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './utils/AuthContext'

function Wrapper() {
   return (
      <>
         <Outlet />
         <Analytics />
      </>
   )
}

// Componente di wrapper per il reindirizzamento automatico
function NewNodeWithRedirect() {
   const navigate = useNavigate();
   
   const handleNodeAdded = (node) => {
      // Reindirizza alla home dopo la creazione del nodo
      navigate('/all');
   };
   
   return <NewNode nodeAdded={handleNodeAdded} />;
}

export default function Router() {
   return (
      <BrowserRouter
         future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
         }}
      >
         <AuthProvider>
            <Routes>
               <Route path="*" element={<Wrapper />}>
                  <Route path="all" element={<GetAll />} />
                  <Route path="archive" element={<ViewArchive />} />
                  <Route path="blog" element={<BlogWrapper />}>
                     <Route path="" element={<ViewPostList />} />
                     <Route path=":key" element={<ViewPost />} />
                  </Route>
                  <Route path="post" element={<BlogWrapper />}>
                     <Route path="new" element={<NewPost />} />
                     <Route path="edit/:key" element={<EditPost />} />
                     <Route
                        path="*"
                        element={<Navigate replace to="/post/new" />}
                     />
                  </Route>
                  <Route path="dashboard" element={<BlogWrapper />}>
                     <Route path=":key" element={<Dashboard />} />
                  </Route>
                  <Route path="profile" element={<BlogWrapper />}>
                     <Route path="" element={<Profile />} />
                     <Route path=":username" element={<UserProfile />} />
                  </Route>
                  <Route path="node" element={<NodesLanding />}>
                     <Route
                        path="new"
                        element={<NewNodeWithRedirect />}
                     />
                     <Route path=":id" element={<ViewNode />} />
                     <Route path="user/:username" element={<UserProfile />} />
                  </Route>
                  <Route path="*" element={<Navigate replace to="/all" />} />
               </Route>
            </Routes>
         </AuthProvider>
      </BrowserRouter>
   )
}
