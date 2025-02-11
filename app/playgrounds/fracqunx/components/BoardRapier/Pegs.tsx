import { RigidBody } from '@react-three/rapier'
import { Shape } from 'three'
import { useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'



type PegShape = 'cylinder' | 'sphere' | 'hexagon'

interface PegProps {
    position: [number, number, number]
    pegRadius: number
    pegColor: string
    shape: PegShape
    index: number
    onClick?: (index: number) => void
    onHover?: (index: number) => void
    onHoverEnd?: (index: number) => void
}

const createHexagonShape = (radius: number): Shape => {
    const shape = new Shape()
    for (let i = 0; i <= 6; i++) {
        const angle = (i * Math.PI) / 3
        const x = radius * Math.cos(angle)
        const y = radius * Math.sin(angle)
        if (i === 0) {
            shape.moveTo(x, y)
        } else {
            shape.lineTo(x, y)
        }
    }
    return shape
}

export const Peg: React.FC<PegProps> = ({
    position,
    pegRadius,
    pegColor,
    shape,
    index,
    onClick,
    onHover,
    onHoverEnd
}) => {
    const [hovered, setHovered] = useState(false)

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onClick?.(index)
    }

    const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
        onHover?.(index)
    }

    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        setHovered(false)
        document.body.style.cursor = 'auto'
        onHoverEnd?.(index)
    }

    const getGeometry = () => {
        switch (shape) {
            case 'cylinder':
                return (
                    <cylinderGeometry
                        args={[pegRadius, pegRadius, pegRadius * 2]}
                    />
                )
            case 'sphere':
                return <sphereGeometry args={[pegRadius]} />
            case 'hexagon':
                return (
                    <extrudeGeometry
                        args={[
                            createHexagonShape(pegRadius),
                            {
                                depth: pegRadius * 2,
                                bevelEnabled: false
                            }
                        ]}
                    />
                )
            default:
                return (
                    <cylinderGeometry
                        args={[pegRadius, pegRadius, pegRadius * 2]}
                    />
                )
        }
    }

    const getRotation = (): [number, number, number] => {
        switch (shape) {
            case 'cylinder':
                return [Math.PI / 2, 0, 0]
            case 'hexagon':
                return [0, 0, Math.PI / 2]
            default:
                return [0, 0, 0]
        }
    }

    return (
        <RigidBody
            key={index}
            type="fixed"
            position={position}
            colliders="hull"
        >
            <mesh
                rotation={getRotation()}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                {getGeometry()}
                <meshStandardMaterial
                    color={hovered ? '#7f530b' : pegColor}
                />
            </mesh>
        </RigidBody>
    )
}

// Usage example:
interface PegFieldProps {
    pegs: [number, number][]
    pegRadius: number
    pegColor: string
    shape: PegShape
    onPegClick?: (index: number) => void
    onPegHover?: (index: number) => void
    onPegHoverEnd?: (index: number) => void
}

const PegField: React.FC<PegFieldProps> = ({
    pegs,
    pegRadius,
    pegColor,
    shape,
    onPegClick,
    onPegHover,
    onPegHoverEnd
}) => {
    return (
        <>
            {pegs.map(([x, y], i) => (
                <Peg
                    key={i}
                    position={[x, y, 0]}
                    pegRadius={pegRadius}
                    pegColor={pegColor}
                    shape={shape}
                    index={i}
                    onClick={onPegClick}
                    onHover={onPegHover}
                    onHoverEnd={onPegHoverEnd}
                />
            ))}
        </>
    )
}



export default PegField;
