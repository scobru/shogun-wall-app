import UsernameSession from './UsernameSession'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import WallieLeft from './Wallie-Icon-Left.png'
import WallieRight from './Wallie-Icon-Right.png'
import { DropDownStyled } from '../Interface/Dropdown'
import { useMemo } from 'react'
import { random } from 'lodash'
import { useClock } from './useClock'
import { Button } from 'Interface'
import { DarkToggle } from './DarkToggle'

const TopBarStyled = styled.div`
   background: var(--win95-silver);
   border: 2px solid;
   border-color: var(--win95-light-gray) var(--win95-dark-gray) var(--win95-dark-gray) var(--win95-light-gray);
   border-bottom: 1px solid var(--win95-dark-gray);

   display: flex;
   justify-content: flex-start;
   align-items: center;
   padding: 4px 8px;
   gap: 4px;
   height: 32px;
   
   .beta {
      transform: rotate(180deg);
      color: #f8633c;
      font-weight: bold;
      font-size: 10px;
      font-style: italic;
      margin-left: 3px;
      margin-bottom: 8px;
   }
   
   .nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
   }
   
   .nav-button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--win95-silver);
      color: var(--win95-black);
      border: 1px solid;
      border-color: var(--win95-light-gray) var(--win95-dark-gray) var(--win95-dark-gray) var(--win95-light-gray);
      border-radius: 0;
      text-decoration: none;
      font-size: 11px;
      font-weight: normal;
      font-family: 'MS Sans Serif', sans-serif;
      cursor: pointer;
      min-height: 20px;
      
      &:hover {
         background: #d4d0c8;
      }
      
      &:active {
         border-color: var(--win95-dark-gray) var(--win95-light-gray) var(--win95-light-gray) var(--win95-dark-gray);
         padding: 5px 7px 3px 9px;
      }
      
      &.primary {
         background: var(--hal-red);
         color: var(--win95-white);
         border-color: var(--hal-red-light) var(--hal-red-dark) var(--hal-red-dark) var(--hal-red-light);
         
         &:hover {
            background: var(--hal-red-dark);
         }
         
         &:active {
            border-color: var(--hal-red-dark) var(--hal-red-light) var(--hal-red-light) var(--hal-red-dark);
         }
      }
   }
   
   .usernameSession {
      margin-left: auto;
      
      input {
         height: 20px;
         padding: 2px 4px;
         border: 1px solid;
         border-color: var(--win95-dark-gray) var(--win95-light-gray) var(--win95-light-gray) var(--win95-dark-gray);
         border-radius: 0;
         background: var(--win95-white);
         color: var(--win95-black);
         font-size: 11px;
         font-family: 'MS Sans Serif', sans-serif;
         
         &:focus {
            outline: 1px dotted var(--win95-black);
            outline-offset: -2px;
         }
      }
   }
   .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      .halText {
         margin-top: 0;
         margin-left: 6px;
         color: var(--hal-red);
         font-family: 'MS Sans Serif', sans-serif;
         font-weight: bold;
         font-size: 14px;
         text-shadow: 1px 1px 0 var(--win95-light-gray);
         letter-spacing: 1px;
         
         &::before {
            content: "●";
            color: var(--hal-red);
            margin-right: 4px;
            animation: halBlink 2s ease-in-out infinite;
         }
         
         @keyframes halBlink {
            0%, 80% { 
               opacity: 1;
               text-shadow: 0 0 4px var(--hal-red);
            }
            90% { 
               opacity: 0.3;
            }
            100% { 
               opacity: 1;
               text-shadow: 0 0 6px var(--hal-red);
            }
         }
      }
   }
   .darkToggle {
      margin-top: 3px;
      margin-left: auto;
   }
`

const TopBar = () => {
   const clock = useClock()
   const RandomLogo = useMemo(() => {
      return [WallieLeft, WallieRight][random(0, 1)]
   }, [])
   return (
      <TopBarStyled>
         <Link to="/all" className="logo">
            <div className="halText">HAL 9000</div>
         </Link>
         
         <div className="nav">
            <Link to="/node/new" className="nav-button primary">
               <div>New</div>
               <img src={RandomLogo} alt="HAL Interface" style={{ 
                  height: '16px', 
                  filter: 'brightness(0) invert(1)' 
               }} />
            </Link>
            
            <Link to="/blog" className="nav-button">
               📝 Blog
            </Link>
            
            <Link to="/archive" className="nav-button">
               🗄️ Archive
         </Link>
            
            {clock && (
               <Link to="/dashboard/clock" className="nav-button">
                  🕐 {clock.directionText}
               </Link>
            )}
         </div>
         
         <div className="usernameSession">
            <UsernameSession />
         </div>
         
            <DarkToggle />
      </TopBarStyled>
   )
}

export default TopBar
