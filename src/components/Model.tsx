import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, extend } from "react-three-fiber";
import { PerspectiveCamera, Html } from "drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Html center>Something went wrong.</Html>;
    }

    return this.props.children;
  }
}

const Model = () => {
  const group = useRef<THREE.Group | null>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  // Load model
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      "/scene.gltf",
      (gltf) => {
        const loadedModel = gltf.scene;
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = shaderMaterial;
          }
        });
        loadedModel.scale.set(75, 75, 75);
        loadedModel.position.set(-75, -75, -75);
        setModel(loadedModel);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );
  }, [shaderMaterial]);

  // Mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    if (group.current) {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      group.current.rotation.y = x * Math.PI; // Rotate based on mouse X
      group.current.rotation.x = y * Math.PI; // Rotate based on mouse Y
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return model ? (
    <group ref={group} dispose={null}>
      <primitive object={model} />
    </group>
  ) : (
    <Html center>Loading...</Html>
  );
};

// Custom camera component
const CustomCamera = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  useFrame(() => {
    if (cameraRef.current) {
      const t = performance.now() * 0.0005;
      cameraRef.current.position.x = Math.sin(t) * 10;
      cameraRef.current.position.z = Math.cos(t) * 10;
      cameraRef.current.lookAt(0, 0, 0); // Make the camera look at the origin
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={75}
      aspect={window.innerWidth / window.innerHeight}
      near={0.1}
      far={1000}
      position={[0, 2, 10]}
    />
  );
};

// Main scene component
const Scene = () => {
  return (
    <ErrorBoundary>
      <Canvas>
        <CustomCamera />
        <ambientLight intensity={0.5} />
        <Model />
      </Canvas>
    </ErrorBoundary>
  );
};

export default Scene;
