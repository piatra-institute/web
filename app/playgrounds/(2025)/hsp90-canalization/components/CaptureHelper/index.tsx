import { useThree } from '@react-three/fiber';
import { useImperativeHandle, forwardRef } from 'react';



export interface CaptureHandle {
    capture: () => string;          // returns PNG data-URL
}

const CaptureHelper = forwardRef<CaptureHandle>((_, ref) => {
    const { gl } = useThree();

    useImperativeHandle(ref, () => ({
        capture: () => gl.domElement.toDataURL('image/png'),
    }), [gl]);

    return null;                    // renders nothing
});

CaptureHelper.displayName = 'CaptureHelper';

export default CaptureHelper;
