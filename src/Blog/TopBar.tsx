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
   box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
      rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;

   display: flex;
   justify-content: flex-start;
   padding: 0.4rem 0rem;
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
      margin-left: 1em;
      padding-top: 4px;
   }
   .usernameSession {
      input {
         height: 30px;
      }
   }
   .newNode button {
      display: flex;
      align-items: center;
      margin-top: 5px;
      margin-left: 10px;
      height: 30px;
      font-weight: 800;
      font-size: 1rem;
      div {
         margin-left: 4px;
      }
      img {
         height: 27px;
         padding-bottom: 5px;
         padding-top: 4px;
         padding-left: 5px;
      }
   }
   .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      .halText {
         margin-top: -5px;
         margin-left: 5px;
         color: var(--text-color);
         font-family: 'Work Sans', sans-serif;
         font-weight: 800;
         font-size: 24px;
         background: linear-gradient(
            45deg,
            var(--hal-red) 0%,
            #ff3333 25%,
            #cc0000 50%,
            #990000 75%,
            var(--hal-red-dark) 100%
         );
         background-size: 200% auto;
         background-clip: text;
         -webkit-background-clip: text;
         -webkit-text-fill-color: transparent;
         animation: halGlow 3s ease-in-out infinite;
         position: relative;
         text-shadow: 0 0 10px rgba(204, 0, 0, 0.3);
         
         &::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--hal-red);
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.4s ease-out;
            box-shadow: 0 0 5px var(--hal-red);
         }
         
         &:hover::after {
            transform: scaleX(1);
            transform-origin: left;
         }
         
         @keyframes halGlow {
            0%, 100% {
               background-position: 0% 50%;
               filter: brightness(1);
            }
            50% {
               background-position: 100% 50%;
               filter: brightness(1.2);
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
         {' '}
         <Link to="/all" className="logo">
            {' '}
            <div className="halText">HAL 9000</div>
         </Link>
         <Link to="/node/new" className="newNode">
            <Button>
               <div>New</div>
               <img src={RandomLogo} alt="HAL Interface" />
            </Button>
         </Link>
         <div className="nav">
            {clock && (
               <DropDownStyled>
                  <Link to="/dashboard/clock">{clock.directionText}</Link>
               </DropDownStyled>
            )}
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
