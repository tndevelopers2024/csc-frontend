import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

function Model({ url }) {
  const geometry = useLoader(STLLoader, url);
  
  // Compute normals for proper lighting if they don't exist
  useMemo(() => {
    geometry.computeVertexNormals();
  }, [geometry]);

  return (
    <mesh geometry={geometry} scale={[1, 1, 1]}>
      <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.7} />
    </mesh>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("STL Loader Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[20, 20, 20]} />
          <meshStandardMaterial color="red" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

export default function StlViewer({ url }) {
  return (
    <div className="w-full h-full relative bg-[#e2e8f0] cursor-move">
      <Canvas camera={{ position: [100, 100, 100], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Center>
              <Model url={url} />
            </Center>
            <Environment preset="city" />
          </Suspense>
        </ErrorBoundary>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
