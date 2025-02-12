import { RigidBody } from '@react-three/rapier';
import { Shape } from 'three';
import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';

import {
    PegData,
} from './data';



export type PegShape = 'cylinder' | 'sphere' | 'hexagon';

export interface PegProps {
    position: [number, number, number];
    pegRadius: number;
    pegColor: string;
    shape: PegShape;
    aoe: boolean;
    aoeSize: number;
    aoeSpeed: number;
    index: number;
    clickable: boolean;
    onClick?: (index: number) => void;
    onHover?: (index: number) => void;
    onHoverEnd?: (index: number) => void;
}

const createHexagonShape = (radius: number): Shape => {
    const shape = new Shape();
    for (let i = 0; i <= 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    return shape;
}

export const Peg: React.FC<PegProps> = ({
    position,
    pegRadius,
    pegColor,
    shape,
    aoe,
    aoeSize,
    aoeSpeed,
    index,
    clickable,
    onClick,
    onHover,
    onHoverEnd,
}) => {
    const [hovered, setHovered] = useState(false);

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        if (!clickable) {
            return;
        }

        event.stopPropagation();
        onClick?.(index);
    }

    const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
        if (!clickable) {
            return;
        }

        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        onHover?.(index);
    }

    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
        if (!clickable) {
            return;
        }

        event.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
        onHoverEnd?.(index);
    }

    const getGeometry = () => {
        switch (shape) {
            case 'cylinder':
                return (
                    <cylinderGeometry
                        args={[pegRadius, pegRadius, pegRadius * 2]}
                    />
                );
            case 'sphere':
                return (<sphereGeometry args={[pegRadius]} />);
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
                );
            default:
                return (
                    <cylinderGeometry
                        args={[pegRadius, pegRadius, pegRadius * 2]}
                    />
                );
        }
    }

    const getRotation = (): [number, number, number] => {
        switch (shape) {
            case 'cylinder':
                return [Math.PI / 2, 0, 0];
            case 'hexagon':
                return [0, 0, Math.PI / 2];
            default:
                return [0, 0, 0];
        }
    }

    const getAoeColor = () => {
        return aoeSpeed >= 0 ? '#5f6151' : '#a12405';
    };

    return (
        <>
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

            {aoe && (
                <group
                    position={[position[0], position[1], position[2] - 0.11 - index / 10000]}
                    raycast={() => null}
                >
                    {/* White border ring */}
                    <mesh>
                        <ringGeometry args={[aoeSize, aoeSize + 0.01, 32]} />
                        <meshBasicMaterial
                            color="#FFFFFF"
                            side={2}
                        />
                    </mesh>

                    {/* Main AoE ring */}
                    <mesh>
                        <ringGeometry args={[0.1, aoeSize, 32]} />
                        <meshBasicMaterial
                            color={getAoeColor()}
                            side={2}
                        />
                    </mesh>
                </group>
            )}
        </>
    );
}


export interface PegFieldProps {
    pegs: PegData[];
    pegRadius: number;
    pegColor: string;
    shape: PegShape;
    clickable: boolean;
    onPegClick?: (index: number) => void;
    onPegHover?: (index: number) => void;
    onPegHoverEnd?: (index: number) => void;
}

const PegField: React.FC<PegFieldProps> = ({
    pegs,
    pegRadius,
    pegColor,
    shape,
    clickable,
    onPegClick,
    onPegHover,
    onPegHoverEnd
}) => {
    return (
        <>
            {pegs.map(({
                x,
                y,
                aoe,
                aoeSize,
                aoeSpeed
            }, i) => (
                <Peg
                    key={i}
                    position={[x, y, 0]}
                    pegRadius={pegRadius}
                    pegColor={pegColor}
                    aoe={aoe}
                    aoeSize={aoeSize}
                    aoeSpeed={aoeSpeed}
                    shape={shape}
                    index={i}
                    clickable={clickable}
                    onClick={onPegClick}
                    onHover={onPegHover}
                    onHoverEnd={onPegHoverEnd}
                />
            ))}
        </>
    );
}


export default PegField;
