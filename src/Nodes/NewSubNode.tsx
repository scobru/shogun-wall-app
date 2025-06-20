import { useEffect, useState } from 'react'
import { NewNode } from '.'
import useKeyboard from '../utils/useKeyboard'
import { NewSubNodeProps } from './NewNode'
import styled from 'styled-components'

const Wrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: stretch;
`

const CommentButton = styled.button`
   width: 100%;
   padding: 16px;
   font-weight: 600;
   cursor: pointer;
   color: var(--primary-600);
   background-color: var(--card-color);
   border: 2px dashed var(--primary-300);
   border-radius: 12px;
   font-size: 15px;
   transition: all 0.2s ease;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 8px;
   
   &:hover {
      background-color: var(--primary-50);
      border-color: var(--primary-400);
      color: var(--primary-700);
   }
   
   &:active {
      transform: translateY(1px);
   }
`

const FormContainer = styled.div`
   border: 1px solid var(--gray-200);
   border-radius: 12px;
   background-color: var(--card-color);
   padding: 20px;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
   position: relative;
`

const FormHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 16px;
   padding-bottom: 12px;
   border-bottom: 1px solid var(--gray-200);
`

const FormTitle = styled.h3`
   margin: 0;
   color: var(--text-color);
   font-size: 18px;
   font-weight: 600;
   display: flex;
   align-items: center;
   gap: 8px;
`

const CancelButton = styled.button`
   background: none;
   border: none;
   color: var(--gray-500);
   font-size: 20px;
   cursor: pointer;
   padding: 4px;
   border-radius: 6px;
   transition: all 0.2s ease;
   
   &:hover {
      background-color: var(--gray-100);
      color: var(--error-600);
   }
`

const NewSubNode = ({ head, dashboardFeature }: NewSubNodeProps) => {
   const [pressed, setPressed] = useState(false)
   const keypressed = useKeyboard(['n', 'c'])

   useEffect(() => {
      if (keypressed === 'n') {
         setPressed(true)
      }
      if (keypressed === 'c') {
         setPressed(false)
      }
   }, [keypressed])

   const nodeAdded = (data: any) => {
      setPressed(false)
   }

   return (
      <Wrapper>
         {!pressed && (
            <CommentButton onClick={() => setPressed(true)}>
               Aggiungi un commento
            </CommentButton>
         )}

         {pressed && (
            <FormContainer>
               <FormHeader>
                  <FormTitle>
                     Nuovo Commento
                  </FormTitle>
                  <CancelButton 
                     onClick={() => setPressed(false)}
                     title="Chiudi form"
                  >
                     X
                  </CancelButton>
               </FormHeader>
               
               <NewNode
                  head={head}
                  nodeAdded={nodeAdded}
                  dashboardFeature={dashboardFeature}
               />
            </FormContainer>
         )}
      </Wrapper>
   )
}

export default NewSubNode
