// Variables globales
        let scene, camera, renderer, cube;
        let cubeWidth = 20.0;
        let cubeHeight = 20.0;
        let cubeDepth = 20.0;
        
        // Configuración inicial
        function init() {
            // Crear escena
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x222222);
            
            // Configurar cámara
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(50, 50, 50);
            camera.lookAt(0, 0, 0);
            
            // Crear renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.getElementById('container').appendChild(renderer.domElement);
            
            // Crear cubo
            createCube();
            
            // Iluminación
            setupLighting();
            
            // Controles de cámara básicos
            setupCameraControls();
            
            // Event listeners
            setupEventListeners();
            
            // Iniciar animación (sin rotación automática)
            animate();
        }
        
        function createCube() {
            // Remover cubo anterior si existe
            if (cube) {
                scene.remove(cube);
            }
            
            // Crear geometría del cubo con dimensiones específicas
            const geometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeDepth);
            
            // Material con color
            const material = new THREE.MeshPhongMaterial({ 
                color: document.getElementById('colorPicker').value,
                shininess: 100
            });
            
            // Crear cubo
            cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.receiveShadow = true;
            
            // Agregar wireframe
            const wireframe = new THREE.WireframeGeometry(geometry);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.3, transparent: true });
            const wireframeMesh = new THREE.LineSegments(wireframe, lineMaterial);
            cube.add(wireframeMesh);
            
            scene.add(cube);
            
            // Actualizar display de dimensiones
            updateDimensionsDisplay();
        }
        
        function setupLighting() {
            // Luz ambiental
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            scene.add(ambientLight);
            
            // Luz direccional
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(100, 100, 50);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);
            
            // Luz puntual
            const pointLight = new THREE.PointLight(0xffffff, 0.3);
            pointLight.position.set(-100, -100, -50);
            scene.add(pointLight);
        }
        
        function setupCameraControls() {
            let isMouseDown = false;
            let mouseX = 0, mouseY = 0;
            let targetX = 0, targetY = 0;
            
            renderer.domElement.addEventListener('mousedown', (e) => {
                isMouseDown = true;
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
            
            renderer.domElement.addEventListener('mousemove', (e) => {
                if (!isMouseDown) return;
                
                const deltaX = e.clientX - mouseX;
                const deltaY = e.clientY - mouseY;
                
                targetX += deltaX * 0.01;
                targetY += deltaY * 0.01;
                
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
            
            renderer.domElement.addEventListener('mouseup', () => {
                isMouseDown = false;
            });
            
            renderer.domElement.addEventListener('wheel', (e) => {
                camera.position.multiplyScalar(e.deltaY > 0 ? 1.1 : 0.9);
            });
            
            // Actualizar rotación de la cámara
            function updateCamera() {
                const radius = camera.position.length();
                camera.position.x = radius * Math.cos(targetY) * Math.cos(targetX);
                camera.position.y = radius * Math.sin(targetY);
                camera.position.z = radius * Math.cos(targetY) * Math.sin(targetX);
                camera.lookAt(0, 0, 0);
                requestAnimationFrame(updateCamera);
            }
            updateCamera();
        }
        
        function setupEventListeners() {
            // Controles de dimensiones
            const widthInput = document.getElementById('widthInput');
            const heightInput = document.getElementById('heightInput');
            const depthInput = document.getElementById('depthInput');
            
            widthInput.addEventListener('input', updateDimensions);
            heightInput.addEventListener('input', updateDimensions);
            depthInput.addEventListener('input', updateDimensions);
            
            // Control de color
            document.getElementById('colorPicker').addEventListener('change', () => {
                createCube();
            });
            
            // Botón de exportación
            document.getElementById('exportBtn').addEventListener('click', exportToSTEP);
            
            // Redimensionar ventana
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
        
        function updateDimensions() {
            const widthInput = document.getElementById('widthInput');
            const heightInput = document.getElementById('heightInput');
            const depthInput = document.getElementById('depthInput');
            
            cubeWidth = Math.max(0.1, parseFloat(widthInput.value) || 0.1);
            cubeHeight = Math.max(0.1, parseFloat(heightInput.value) || 0.1);
            cubeDepth = Math.max(0.1, parseFloat(depthInput.value) || 0.1);
            
            createCube();
        }
        
        function setDimensions(w, h, d) {
            document.getElementById('widthInput').value = w;
            document.getElementById('heightInput').value = h;
            document.getElementById('depthInput').value = d;
            updateDimensions();
        }
        
        function updateDimensionsDisplay() {
            const display = document.getElementById('dimensionsDisplay');
            display.textContent = `${cubeWidth.toFixed(1)} × ${cubeHeight.toFixed(1)} × ${cubeDepth.toFixed(1)} mm`;
        }
        
        // Función de animación sin rotación automática
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        
        function exportToSTEP() {
            // Generar contenido STEP para un cubo con dimensiones específicas
            const stepContent = generateSTEPContent();
            
            // Crear y descargar archivo
            const blob = new Blob([stepContent], { type: 'application/step' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cubo_${cubeWidth.toFixed(1)}x${cubeHeight.toFixed(1)}x${cubeDepth.toFixed(1)}.step`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Feedback visual
            const btn = document.getElementById('exportBtn');
            const originalText = btn.textContent;
            btn.textContent = '✅ Exportado!';
            btn.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            }, 2000);
        }
        
        function generateSTEPContent() {
            const w = cubeWidth;
            const h = cubeHeight;
            const d = cubeDepth;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            return `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Cubo 3D - ${w}x${h}x${d}'),'2;1');
FILE_NAME('cubo_${w.toFixed(1)}x${h.toFixed(1)}x${d.toFixed(1)}.step','${timestamp}',('Usuario'),('Generador Web'),'Navegador','STEP Export v1.0','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;

DATA;
/* === CONTEXTO Y UNIDADES === */
#1 = APPLICATION_CONTEXT('automotive_design');
#2 = APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',1994,#1);
#3 = (GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#7))GLOBAL_UNIT_ASSIGNED_CONTEXT((#4,#5,#6))REPRESENTATION_CONTEXT('Context #1','3D Context with UNIT and UNCERTAINTY'));
#4 = (LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.));
#5 = (NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.));
#6 = (NAMED_UNIT(*)SOLID_ANGLE_UNIT()SI_UNIT($,.STERADIAN.));
#7 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#4,'distance_accuracy_value','confusion accuracy');

/* === SISTEMA DE COORDENADAS === */
#8 = CARTESIAN_POINT('Origin',(0.,0.,0.));
#9 = DIRECTION('Z',(0.,0.,1.));
#10 = DIRECTION('X',(1.,0.,0.));
#11 = DIRECTION('Y',(0.,1.,0.));
#12 = AXIS2_PLACEMENT_3D('World',#8,#9,#10);

/* === VERTICES DEL CUBO === */
#20 = CARTESIAN_POINT('P1',(0.,0.,0.));
#21 = CARTESIAN_POINT('P2',(${w},0.,0.));
#22 = CARTESIAN_POINT('P3',(${w},${h},0.));
#23 = CARTESIAN_POINT('P4',(0.,${h},0.));
#24 = CARTESIAN_POINT('P5',(0.,0.,${d}));
#25 = CARTESIAN_POINT('P6',(${w},0.,${d}));
#26 = CARTESIAN_POINT('P7',(${w},${h},${d}));
#27 = CARTESIAN_POINT('P8',(0.,${h},${d}));

/* === DIRECCIONES === */
#30 = DIRECTION('DX',(1.,0.,0.));
#31 = DIRECTION('DY',(0.,1.,0.));
#32 = DIRECTION('DZ',(0.,0.,1.));
#33 = DIRECTION('D-X',(-1.,0.,0.));
#34 = DIRECTION('D-Y',(0.,-1.,0.));
#35 = DIRECTION('D-Z',(0.,0,-1.));

/* === VECTORES === */
#40 = VECTOR('VX',#30,${w});
#41 = VECTOR('VY',#31,${h});
#42 = VECTOR('VZ',#32,${d});

/* === LÍNEAS (ARISTAS) === */
#50 = LINE('L1',#20,#40);  /* P1-P2 */
#51 = LINE('L2',#21,#41);  /* P2-P3 */
#52 = LINE('L3',#22,#33);  /* P3-P4 */
#53 = LINE('L4',#23,#34);  /* P4-P1 */
#54 = LINE('L5',#24,#40);  /* P5-P6 */
#55 = LINE('L6',#25,#41);  /* P6-P7 */
#56 = LINE('L7',#26,#33);  /* P7-P8 */
#57 = LINE('L8',#27,#34);  /* P8-P5 */
#58 = LINE('L9',#20,#42);  /* P1-P5 */
#59 = LINE('L10',#21,#42); /* P2-P6 */
#60 = LINE('L11',#22,#42); /* P3-P7 */
#61 = LINE('L12',#23,#42); /* P4-P8 */

/* === CARAS DEL CUBO === */
/* Cara inferior (Z=0) */
#70 = PLANE('Bottom',#71);
#71 = AXIS2_PLACEMENT_3D('BottomPlace',#20,#35,#30);

/* Cara superior (Z=${d}) */
#72 = PLANE('Top',#73);
#73 = AXIS2_PLACEMENT_3D('TopPlace',#24,#32,#30);

/* Cara frontal (Y=0) */
#74 = PLANE('Front',#75);
#75 = AXIS2_PLACEMENT_3D('FrontPlace',#20,#34,#30);

/* Cara trasera (Y=${h}) */
#76 = PLANE('Back',#77);
#77 = AXIS2_PLACEMENT_3D('BackPlace',#23,#31,#30);

/* Cara izquierda (X=0) */
#78 = PLANE('Left',#79);
#79 = AXIS2_PLACEMENT_3D('LeftPlace',#20,#33,#32);

/* Cara derecha (X=${w}) */
#80 = PLANE('Right',#81);
#81 = AXIS2_PLACEMENT_3D('RightPlace',#21,#30,#32);

/* === GEOMETRÍA SÓLIDA === */
#100 = BLOCK();
#101 = AXIS2_PLACEMENT_3D('BlockPlace',#20,#32,#30);
#102 = SHAPE_REPRESENTATION_RELATIONSHIP('','',#103,#104);
#103 = SHAPE_REPRESENTATION('Block',(#100),#3);
#104 = SHAPE_REPRESENTATION('Context',(#12),#3);

/* === DEFINICIÓN DEL PRODUCTO === */
#200 = PRODUCT('CUBO_3D','Cubo sólido ${w}x${h}x${d} mm','documento-generado',(#201));
#201 = PRODUCT_CONTEXT('',#1,'mechanical');
#202 = PRODUCT_DEFINITION_FORMATION('','',#200);
#203 = PRODUCT_DEFINITION('design','',#202,#204);
#204 = PRODUCT_DEFINITION_CONTEXT('part definition',#1,'design');
#205 = PRODUCT_DEFINITION_SHAPE('','',#203);

/* === REPRESENTACIÓN GEOMÉTRICA === */
#300 = SHAPE_DEFINITION_REPRESENTATION(#205,#103);
#301 = NEXT_ASSEMBLY_USAGE_OCCURRENCE('','','',#203,#203,$);

ENDSEC;
END-ISO-10303-21;`;
        }
        
        // Inicializar la aplicación
        init();