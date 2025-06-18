import styled from 'styled-components'

export const ITEM_BORDER = '3px solid var(--widget-color)'

export const ViewNode = styled.div`
   display: flex;
   flex-direction: column;
   margin-top: 12px;
   margin-bottom: 12px;
   padding: 12px;
   border-radius: 12px;
   background-color: var(--card-color);
`

export const BackSectionWrapper = styled.div`
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   width: 100%;
   height: 32px;
`

export const BackButton = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   width: 32px;
   height: 32px;
   background-color: var(--widget-color);
   cursor: pointer;
   &:hover {
      background-color: var(--shadow-light1);
   }
`

export const MessageWrapper = styled.div`
   border: ${ITEM_BORDER};
   border-radius: 9px;
   margin-top: 12px;
   padding: 12px;
`

export const MessageTop = styled.div`
   display: flex;
   flex-direction: row;
   justify-content: flex-start;
   margin-bottom: 8px;
`

export const Username = styled.div`
   padding: 3px 8px;
   background-color: var(--accent-color);
   border-radius: 12px;
   font-weight: 600;
   margin-right: 8px;
   font-size: 14px;
   display: flex;
   align-items: center;
   
   &.shogun-user {
      background-color: #28a745;
      color: white;
   }
   
   .verified-badge {
      margin-left: 4px;
      font-size: 11px;
   }
`

export const MessageDate = styled.div`
   padding-top: 3px;
   margin-right: 8px;
   color: #666;
   font-size: 13px;
   font-style: italic;
`

export const Message = styled.div`
   font-size: 16px;
   line-height: 1.4;
   
   a {
      color: var(--accent-color);
      text-decoration: none;
      
      &:hover {
         text-decoration: underline;
      }
   }
   
   img {
      max-width: 100%;
      height: auto;
      margin: 12px 0;
      border-radius: 8px;
   }
`

export const NewNodeWrapper = styled.div`
   margin-top: 32px;
` 