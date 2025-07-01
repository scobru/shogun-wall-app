import { useState } from 'react'
import styled from 'styled-components'
import { Styles, SimpleIconProps, stylesColors } from './'

const getColorFromStyle = (
    style: Styles = Styles.default,
    hovered: Boolean
) => {
    if (!hovered) {
        return stylesColors[Styles.default]
    }
    return stylesColors[style]
}

const StyledSimpleIcon = styled.div<{
    style: Styles
    hovered: Boolean
    showBorder?: Boolean
}>`
    display: flex;
    cursor: pointer;
    color: ${({ style, hovered }) => getColorFromStyle(style, hovered)};
    border: ${({ showBorder }) => (showBorder ? '1px solid var(--border)' : 'none')};
    padding: 0rem 0rem 0rem 0rem;
    user-select: none;
    width: 3rem;
    align-items: center;
`

const SimpleIcon = ({ content, hoverContent, ...props }: SimpleIconProps) => {
    const [hovered, setHovered] = useState(false)

    const entered = () => {
        setHovered(true)
    }
    const left = () => {
        setHovered(false)
    }

    return (
        <StyledSimpleIcon
            onMouseEnter={entered}
            onMouseLeave={left}
            hovered={hovered}
            {...props}
        >
            <div>{hovered && hoverContent}</div>
            <div>{!hovered && content}</div>
        </StyledSimpleIcon>
    )
}

export default SimpleIcon
