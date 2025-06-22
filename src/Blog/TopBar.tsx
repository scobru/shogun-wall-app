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

import 'shogun-button-react/styles.css'

const TopBarStyled = styled.div`
   background: var(--surface);
   border-bottom: 1px solid var(--border);
   box-shadow: var(--shadow-sm);
   position: relative;
   z-index: 100;
   
   display: flex;
   justify-content: flex-start;
   align-items: center;
   padding: var(--space-3) var(--space-4);
   gap: var(--space-3);
   min-height: 64px;
   overflow: hidden;
   width: 100%;
   
   .beta {
      transform: rotate(180deg);
      color: var(--error-500);
      font-weight: 600;
      font-size: 10px;
      font-style: italic;
      margin-left: var(--space-1);
      margin-bottom: var(--space-2);
   }
   
   .nav {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex: 1;
      min-width: 0;
   }
   
   .nav-button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 40px;
      
      &:hover {
         background: var(--surface-hover);
         border-color: var(--border-hover);
         transform: translateY(-1px);
         box-shadow: var(--shadow-sm);
      }
      
      &:active {
         transform: translateY(0);
         box-shadow: none;
      }
      
      &.primary {
         background: var(--accent);
         color: white;
         border-color: var(--accent);
         
         &:hover {
            background: var(--accent-hover);
            border-color: var(--accent-hover);
         }
      }
   }
   
   .usernameSession {
      margin-left: auto;
      margin-right: var(--space-3);
      flex-shrink: 0;
      
      input {
         height: 40px;
         padding: var(--space-2) var(--space-3);
         border: 1px solid var(--border);
         border-radius: var(--radius-md);
         background: var(--surface);
         color: var(--text-primary);
         font-size: 14px;
         font-family: var(--font-sans);
         transition: all 0.2s ease;
         
         &:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
         }
         
         &::placeholder {
            color: var(--text-muted);
         }
      }
   }
   .hal-logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      transition: all 0.2s ease;
      flex-shrink: 0;
      z-index: 1;
      
      &:hover {
         transform: scale(1.02);
      }
      
      .halText {
         margin: 0;
         padding: 0;
         color: var(--accent);
         font-family: var(--font-sans);
         font-weight: 700;
         font-size: 18px;
         letter-spacing: 0.5px;
         white-space: nowrap;
         line-height: 1;
         
         &::before {
            content: "";
            color: var(--accent);
            margin-right: var(--space-2);
            animation: halBlink 2s ease-in-out infinite;
            text-shadow: 0 0 8px currentColor;
            display: inline-block;
         }
         
         @keyframes halBlink {
            0%, 80% { 
               opacity: 1;
               text-shadow: 0 0 8px currentColor;
            }
            90% { 
               opacity: 0.4;
            }
            100% { 
               opacity: 1;
               text-shadow: 0 0 12px currentColor;
            }
         }
      }
   }
   
   .darkToggle {
      flex-shrink: 0;
      display: flex;
      align-items: center;
   }
`

const TopBar = () => {
   const clock = useClock()
   const RandomLogo = useMemo(() => {
      return [WallieLeft, WallieRight][random(0, 1)]
   }, [])
   return (
      <TopBarStyled>
         <Link to="/all" className="hal-logo">
            <div className="halText">HAL 9000</div>
         </Link>
         
         <div className="nav">
            <Link to="/node/new" className="nav-button primary">
               <div>New</div>
               <img src={RandomLogo} alt="HAL Interface" style={{ 
                  height: '18px', 
                  filter: 'brightness(0) invert(1)' 
               }} />
            </Link>
            
            <Link to="/blog" className="nav-button">
               Blog
            </Link>
            
            <Link to="/archive" className="nav-button">
               Archive
            </Link>
            
            <Link to="/profile" className="nav-button">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                     </svg>
                     Profile
            </Link>
            
            {/* {clock && (
               <Link to="/dashboard/clock" className="nav-button">
                  🕐 {clock.directionText}
               </Link>
            )} */}
         </div>
         
         <div className="usernameSession">
            <UsernameSession />
         </div>
         
         <div className="darkToggle">
            <DarkToggle />
         </div>
      </TopBarStyled>
   )
}

export default TopBar
