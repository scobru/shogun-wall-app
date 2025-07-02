import styled from 'styled-components'

export const ITEM_BORDER = '1px solid var(--gray-200)'

export const ViewNode = styled.div`
   display: flex;
   flex-direction: column;
   max-width: 800px;
   margin: 0 auto;
   padding: 20px;
   background-color: var(--background-color);
   min-height: 100vh;
   box-sizing: border-box;
`

export const BackSectionWrapper = styled.div`
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   align-items: center;
   width: 100%;
   margin-bottom: 24px;
   padding: 12px 0;
   border-bottom: 1px solid var(--gray-200);
   box-sizing: border-box;
`

export const BackButton = styled.button`
   display: flex;
   justify-content: center;
   align-items: center;
   padding: 8px 16px;
   background-color: var(--primary-500);
   color: white;
   border: none;
   border-radius: 8px;
   cursor: pointer;
   font-size: 14px;
   font-weight: 500;
   transition: all 0.2s ease;
   box-sizing: border-box;
   
   &:hover {
      background-color: var(--primary-600);
      transform: translateY(-1px);
   }
   
   &:active {
      transform: translateY(0);
   }
`

export const MessageWrapper = styled.div`
   border: ${ITEM_BORDER};
   border-radius: 12px;
   padding: 24px;
   background-color: var(--card-color);
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
   margin-bottom: 24px;
   box-sizing: border-box;
   color: var(--text-color);
`

export const MessageTop = styled.div`
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   align-items: flex-start;
   margin-bottom: 16px;
   padding-bottom: 12px;
   border-bottom: 1px solid var(--gray-200);
   flex-wrap: wrap;
   gap: 12px;
   box-sizing: border-box;
`

export const Username = styled.div`
   padding: 6px 12px;
   background-color: var(--gray-100);
   border-radius: 16px;
   font-weight: 600;
   font-size: 14px;
   display: flex;
   align-items: center;
   color: var(--text-color);
   box-sizing: border-box;
   
   &.shogun-user {
      background-color: var(--success-100);
      color: var(--success-700);
   }
   
   .verified-badge {
      margin-left: 6px;
      font-size: 12px;
      color: var(--success-600);
   }
`

export const MessageDate = styled.div`
   color: var(--gray-600);
   font-size: 13px;
   font-weight: 500;
   font-style: italic;
   line-height: 1.4;
   box-sizing: border-box;
`

export const Message = styled.div`
   font-size: 16px;
   line-height: 1.6;
   color: var(--text-color);
   box-sizing: border-box;
   
   a {
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
         text-decoration: underline;
      }
   }
   
   img {
      max-width: 100%;
      height: auto;
      margin: 16px 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
   }
   
   p {
      margin: 0 0 12px 0;
      
      &:last-child {
         margin-bottom: 0;
      }
   }
   
   blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      border-left: 4px solid var(--primary-200);
      background-color: var(--gray-50);
      font-style: italic;
      color: var(--gray-700);
   }
   
   code {
      background-color: var(--gray-100);
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 14px;
      color: var(--text-color);
   }
   
   pre {
      background-color: var(--gray-100);
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
      border: 1px solid var(--gray-200);
      
      code {
         background: none;
         padding: 0;
      }
   }

   ul, ol {
      margin: 12px 0;
      padding-left: 24px;
      
      li {
         margin-bottom: 6px;
         color: var(--text-color);
      }
   }

   strong, b {
      font-weight: 600;
      color: var(--text-color);
   }

   em, i {
      color: var(--text-color);
   }
`

export const NewNodeWrapper = styled.div`
   margin-top: 32px;
   padding-top: 24px;
   border-top: 1px solid var(--gray-200);
   box-sizing: border-box;
`

export const VoteText = styled.span`
   display: inline-flex;
   align-items: center;
   gap: 4px;
   cursor: pointer;
   font-size: 13px;
   font-weight: 500;
   color: var(--gray-600);
   transition: all 0.15s ease;
   user-select: none;

   &.upvote {
      &:hover {
         color: var(--success-600);
      }
      
      &.voted {
         color: var(--success-600);
         font-weight: 600;
      }
   }

   &.downvote {
      &:hover {
         color: var(--error-600);
      }
      
      &.voted {
         color: var(--error-600);
         font-weight: 600;
      }
   }

   .vote-icon {
      font-size: 11px;
   }

   .vote-count {
      min-width: 16px;
      text-align: center;
   }

   &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
   }
`

export const VoteContainer = styled.div`
   display: flex;
   align-items: center;
   gap: 12px;
   padding: 4px 8px;
   border-radius: 6px;
   background: var(--gray-50);
` 