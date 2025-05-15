/**
 * Archivo JavaScript para la gestión de proyectos y desafíos
 * Este archivo contiene todas las funcionalidades necesarias para la página de administración
 */

// Variables globales
let projectsData = [];
let challengesData = [];

// Constantes para URLs de API
const API_BASE_URL = '/api/proyectos';
const CHALLENGE_API_URL = '/api/desafios';
const CHALLENGE_UPLOAD_URL = '/api/desafios/upload/imagen';

// Funciones de inicialización que se ejecutan al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("ProyectosAdmin.html: DOMContentLoaded");
    
    // Inicialización del menú hamburguesa
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.querySelector('.navbar').classList.toggle('active');
    });
    
    // Inicialización de pestañas
    initTabs();
    
    // Inicializar eventos para cerrar menús al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.project-actions')) {
            document.querySelectorAll('.actions-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
    
    // Verificar si hay un proyecto para mostrar en detalle desde URL
    checkUrlParameters();
});

// Funciones para manejo de pestañas
function initTabs() {
    // Asegurarse de que el formulario de desafíos esté oculto al inicio
    const challengeForm = document.getElementById('challengeForm');
    if (challengeForm) {
        challengeForm.classList.remove('show');
        challengeForm.style.display = 'none';
    }

    // Configurar eventos de clic para botones de pestañas
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            openTab(event, button.dataset.tab + 'Tab');
        });
    });
    
    // Mostrar pestaña activa al inicio
    let activeTabButton = document.querySelector('.tab-btn.active');
    if (activeTabButton) {
        openTab(null, activeTabButton.dataset.tab + 'Tab');
    } else {
        const projectsButton = document.querySelector('.tab-btn[data-tab="projects"]');
        if (projectsButton) {
            openTab(null, 'projectsTab');
        }
    }
}

function openTab(evt, tabName) {
    console.log(`Abriendo pestaña: ${tabName}`);
    
    // Ocultar todas las pestañas
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }

    // Desactivar todos los botones
    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Mostrar la pestaña seleccionada
    const currentTabContent = document.getElementById(tabName);
    if (currentTabContent) {
        currentTabContent.style.display = "block";
        currentTabContent.classList.add("active");
    }
    
    // Activar el botón correspondiente
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    } else {
        const btnToActivate = document.querySelector(`.tab-btn[data-tab="${tabName.replace('Tab','')}"`)
        if (btnToActivate) btnToActivate.classList.add("active");
    }

    // Cargar contenido específico de cada pestaña
    if (tabName === 'projectsTab') {
        loadProjects();
    } else if (tabName === 'challengesTab') {
        loadChallenges();
    }
}

// Funciones de utilidad
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function checkUrlParameters() {
    // Verificar si hay un proyecto para mostrar en detalle
    const projectIdToShow = getUrlParameter('showDetail');
    if (projectIdToShow) {
        // Esperar a que los proyectos se carguen
        setTimeout(() => {
            viewProjectDetails(projectIdToShow);
            
            // Limpiar el parámetro de la URL sin recargar la página
            const url = new URL(window.location);
            url.searchParams.delete('showDetail');
            window.history.pushState({}, '', url);
        }, 1000);
    }
}

// Función para mostrar notificaciones
function showNotification(message, type) {
    // Verificar si ya existe un contenedor de notificaciones
    let notificationContainer = document.getElementById('notification-container');
    
    // Si no existe, crearlo
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // Crear la notificación
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.minWidth = '250px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    
    // Icono según tipo
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    icon.style.marginRight = '10px';
    notification.appendChild(icon);
    
    // Agregar el mensaje
    const textNode = document.createTextNode(message);
    notification.appendChild(textNode);
    
    // Agregar botón de cierre
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.float = 'right';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '15px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.onclick = function() {
        notificationContainer.removeChild(notification);
    };
    notification.appendChild(closeBtn);
    
    // Agregar la notificación al contenedor
    notificationContainer.appendChild(notification);
    
    // Mostrar la notificación con animación
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Eliminar después de 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode === notificationContainer) {
                notificationContainer.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// ======== FUNCIONES PARA GESTIÓN DE PROYECTOS ========

// Función para mostrar/ocultar el formulario de proyectos
function toggleForm() {
    const form = document.getElementById('projectForm');
    form.classList.toggle('show');

    // Si estamos cerrando el formulario, restaurarlo a su estado inicial
    if (!form.classList.contains('show')) {
        // Limpiar formulario
        document.getElementById('newProjectForm').reset();

        // Restaurar título original
        const formTitle = document.querySelector('#projectForm .modal-content h2');
        formTitle.innerHTML = '<i class="fas fa-project-diagram"></i> Crear Nuevo Proyecto';

        // Mostrar botón crear y ocultar botón actualizar
        document.getElementById('createProjectBtn').style.display = 'inline-block';
        document.getElementById('updateProjectBtn').style.display = 'none';

        // Eliminar ID de proyecto en edición
        delete document.getElementById('newProjectForm').dataset.editingProjectId;
    }
}

// Función para cargar proyectos desde la API
async function loadProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    projectsGrid.innerHTML = '<p>Cargando proyectos...</p>';
    
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const projects = await response.json();

        // Guardar proyectos en variable global
        window.projectsData = projects;

        // Limpiar grid antes de renderizar
        projectsGrid.innerHTML = '';

        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p>No hay proyectos creados todavía.</p>';
        } else {
            projects.forEach(project => renderProjectCard(project));
        }
    } catch (error) {
        console.error('Error al cargar proyectos:', error);
        projectsGrid.innerHTML = '<p>Error al cargar los proyectos. Intente de nuevo más tarde.</p>';
    }
}

// Función para renderizar una tarjeta de proyecto
function renderProjectCard(project) {
    const projectsGrid = document.querySelector('.projects-grid');
    
    // Crear tarjeta de proyecto
    const card = document.createElement('div');
    card.className = 'project-admin-card';
    card.dataset.projectId = project.id;

    // Verificar si el proyecto está expirado basado en la fecha actual y el campo fechaExpiracion
    const now = new Date();
    const expDate = project.fechaExpiracion ? new Date(project.fechaExpiracion) : null;
    
    // Actualizar el estado si la fecha de expiración ya pasó pero el estado no se ha actualizado en BD
    if (project.estado === 'ACTIVO' && expDate && expDate < now) {
        console.log(`Proyecto ${project.id} con fecha cumplida, mostrando como COMPLETADO`);
        project.estado = 'COMPLETADO';
    }

    // Obtener días restantes (o estado)
    let daysRemaining = "";
    if (project.estado === 'COMPLETADO' || project.estado === 'COMPLETO') {
        daysRemaining = "Completado";
    } else if (project.estado === 'CANCELADO') {
        daysRemaining = "Cancelado";
    } else if (project.fechaExpiracion) {
        // Verificar si ya expiró basado en la fecha actual
        if (expDate < now) {
            daysRemaining = "Completado";
            // Asegurar que el estado refleje que está completado
            project.estado = 'COMPLETADO';
        } else {
            // Calcular días restantes
            const diffTime = Math.abs(expDate - now);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysRemaining = diffDays + " días restantes";
        }
    } else {
        daysRemaining = "Sin fecha límite";
    }

    // Obtener información de participantes
    const participantesInfo = project.participantesActuales !== null ?
        `${project.participantesActuales}${project.limiteParticipantes ? ' / ' + project.limiteParticipantes : ''}` :
        'N/A';

    // Imagen por defecto en Base64
    const defaultImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE1IiBmaWxsPSIjYmJiIi8+PHBvbHlnb24gcG9pbnRzPSIwLDIwMCAyMDAsMTUwIDIwMCwyMDAiIGZpbGw9IiNiYmIiLz48cGF0aCBkPSJNNjAgOTBMOTAgMTUwIDE0MCAxMTAgMTgwIDE3MCIgc3Ryb2tlPSIjYmJiIiBzdHJva2Utd2lkdGg9IjEwIiBmaWxsPSJub25lIi8+PHRleHQgeD0iNDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjODg4Ij5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';

    // Ruta de imagen con fallback
    const imagePath = project.imagenUrl ? `/static/Proyectos/${project.imagenUrl}` : defaultImageBase64;

    // HTML de la tarjeta
    card.innerHTML = `
        <div class="project-card-wrapper">
            <div class="project-image">
                <div class="project-overlay"></div>
                <img src="${imagePath}" alt="${project.nombre}" onerror="this.src='${defaultImageBase64}'">
            </div>
            <div class="project-content">
                <div class="project-header">
                    <h3>${project.nombre}</h3>
                    <div class="project-actions">
                        <button class="action-toggle-btn" onclick="toggleActions(this)" title="Ver opciones">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="actions-menu">
                            <a onclick="editProject('${project.id}')"><i class="fas fa-edit"></i> Editar</a>
                            <hr>
                            <a onclick="confirmDeleteProject('${project.id}')" class="delete-action"><i class="fas fa-trash-alt"></i> Eliminar</a>
                        </div>
                    </div>
                </div>
                
                <p>${project.descripcion || 'Sin descripción.'}</p>
                
                <div class="project-meta">
                    <span><i class="fas fa-users"></i> ${participantesInfo} voluntarios</span>
                    <span><i class="fas fa-calendar"></i> ${daysRemaining}</span>
                    <span><i class="fas fa-info-circle"></i> ${project.estado || 'ACTIVO'}</span>
                </div>
                
                <div class="project-footer">
                    <button class="view-details-btn" onclick="viewProjectDetails('${project.id}')">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    `;

    // Añadir al grid de proyectos
    projectsGrid.appendChild(card);
}

// Función para mostrar/ocultar el menú de acciones
function toggleActions(btn) {
    // Obtener el menú asociado con este botón
    const menu = btn.nextElementSibling;

    // Si el menú ya está abierto, solo cerrarlo
    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        return;
    }

    // Cerrar todos los otros menús antes de abrir este
    document.querySelectorAll('.actions-menu.show').forEach(m => {
        m.classList.remove('show');
    });

    // Abrir este menú
    menu.classList.add('show');

    // Prevenir que se cierre inmediatamente
    event.stopPropagation();

    // Asegurar que el menú esté dentro del viewport
    setTimeout(() => {
        const menuRect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        // Si el menú se sale del lado derecho de la pantalla
        if (menuRect.right > windowWidth) {
            menu.style.left = 'auto';
            menu.style.right = '100%';
            menu.style.marginLeft = '0';
            menu.style.marginRight = '10px';
        }
    }, 0);
}

// Función para crear un nuevo proyecto
async function createProject(event) {
    event.preventDefault(); // Prevenir envío tradicional

    const nombre = document.getElementById('projectName').value;
    const descripcion = document.getElementById('projectDescription').value;
    const fechaExpiracionInput = document.getElementById('projectExpirationDate').value;
    const crearForo = document.getElementById('createForumCheckbox').checked;
    const participantesLimit = document.getElementById('projectParticipantsLimit').value;
    const imageInput = document.getElementById('projectImageInput');

    // Validar campos requeridos
    if (!nombre || !descripcion) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    // Convertir la fecha de expiración a formato ISO si se proporcionó
    let fechaExpiracion = null;
    if (fechaExpiracionInput) {
        try {
            const dateObj = new Date(fechaExpiracionInput);
            if (!isNaN(dateObj)) {
                fechaExpiracion = dateObj.toISOString();
            }
        } catch (e) {
            console.error("Error procesando fecha de expiración:", e);
        }
    }

    try {
        // Mostrar indicador de carga en el botón
        const createBtn = document.getElementById('createProjectBtn');
        const originalText = createBtn.innerHTML;
        createBtn.disabled = true;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';

        // Primero subir la imagen si existe
        let imagenUrl = null;
        if (imageInput.files && imageInput.files[0]) {
            const formData = new FormData();
            formData.append('imagen', imageInput.files[0]);

            const imageResponse = await fetch('/api/proyectos/upload/proyecto', {
                method: 'POST',
                body: formData
            });

            if (!imageResponse.ok) {
                throw new Error('Error al subir la imagen');
            }

            const imageResult = await imageResponse.json();
            imagenUrl = imageResult.nombreArchivo;
        }

        const newProjectData = {
            nombre,
            descripcion,
            imagenUrl: imagenUrl,
            fechaExpiracion: fechaExpiracion,
            limiteParticipantes: participantesLimit ? parseInt(participantesLimit, 10) : null
        };

        // Construir URL con el parámetro de crear foro
        let url = API_BASE_URL;
        if (crearForo !== undefined) {
            url += `?crearForo=${crearForo}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProjectData)
        });

        // Restaurar el botón
        createBtn.disabled = false;
        createBtn.innerHTML = originalText;

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Respuesta no OK:', errorData);
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const createdProject = await response.json();
        renderProjectCard(createdProject);
        toggleForm(); // Cerrar modal
        
        // Mostrar notificación de éxito
        showNotification('Proyecto creado exitosamente', 'success');
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        alert(`Error al crear el proyecto: ${error.message}`);
        
        // Restaurar el botón en caso de error
        const createBtn = document.getElementById('createProjectBtn');
        createBtn.disabled = false;
        createBtn.innerHTML = '<i class="fas fa-save"></i> Crear Proyecto';
    }
}

// Función para editar un proyecto
function editProject(projectId) {
    // Buscar el proyecto en los datos
    const project = window.projectsData.find(p => p.id === projectId);
    if (!project) {
        alert('No se pudo encontrar el proyecto para editar.');
        return;
    }

    // Abrir el formulario si no está abierto
    const form = document.getElementById('projectForm');
    if (!form.classList.contains('show')) {
        toggleForm();
    }

    // Llenar el formulario con los datos del proyecto
    document.getElementById('projectName').value = project.nombre;
    document.getElementById('projectDescription').value = project.descripcion || '';
    
    // Si hay fecha de expiración, formatearla para el input datetime-local
    if (project.fechaExpiracion) {
        const date = new Date(project.fechaExpiracion);
        // Formato YYYY-MM-DDThh:mm
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
        document.getElementById('projectExpirationDate').value = localDate;
    } else {
        document.getElementById('projectExpirationDate').value = '';
    }
    
    // Establecer límite de participantes
    document.getElementById('projectParticipantsLimit').value = project.limiteParticipantes || '';

    // Mostrar imagen actual si existe
    const imgPreview = document.getElementById('previewImg');
    if (project.imagenUrl) {
        imgPreview.src = `/static/Proyectos/${project.imagenUrl}`;
        imgPreview.style.display = 'block';
    } else {
        imgPreview.style.display = 'none';
    }

    // Cambiar el título del formulario
    const formTitle = document.querySelector('#projectForm .modal-content h2');
    formTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Proyecto';

    // Ocultar botón crear y mostrar botón actualizar
    document.getElementById('createProjectBtn').style.display = 'none';
    document.getElementById('updateProjectBtn').style.display = 'inline-block';

    // Guardar ID del proyecto en edición
    document.getElementById('newProjectForm').dataset.editingProjectId = projectId;
}

// Función para actualizar un proyecto existente
async function updateProject(event) {
    event.preventDefault();

    // Obtener ID del proyecto en edición
    const projectId = document.getElementById('newProjectForm').dataset.editingProjectId;
    if (!projectId) {
        alert('Error: No se pudo identificar el proyecto a actualizar.');
        return;
    }

    // Obtener valores del formulario
    const nombre = document.getElementById('projectName').value;
    const descripcion = document.getElementById('projectDescription').value;
    const fechaExpiracionInput = document.getElementById('projectExpirationDate').value;
    const participantesLimit = document.getElementById('projectParticipantsLimit').value;
    const imageInput = document.getElementById('projectImageInput');

    // Validar campos requeridos
    if (!nombre || !descripcion) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    // Convertir fecha a formato ISO
    let fechaExpiracion = null;
    if (fechaExpiracionInput) {
        try {
            const dateObj = new Date(fechaExpiracionInput);
            if (!isNaN(dateObj)) {
                fechaExpiracion = dateObj.toISOString();
            }
        } catch (e) {
            console.error("Error procesando fecha de expiración:", e);
        }
    }

    try {
        // Mostrar indicador de carga
        const updateBtn = document.getElementById('updateProjectBtn');
        const originalText = updateBtn.innerHTML;
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';

        // Primero subir la imagen si se seleccionó una nueva
        let imagenUrl = null;
        if (imageInput.files && imageInput.files[0]) {
            const formData = new FormData();
            formData.append('imagen', imageInput.files[0]);

            const imageResponse = await fetch('/api/proyectos/upload/proyecto', {
                method: 'POST',
                body: formData
            });

            if (!imageResponse.ok) {
                throw new Error('Error al subir la imagen');
            }

            const imageResult = await imageResponse.json();
            imagenUrl = imageResult.nombreArchivo;
        } else {
            // Si no se seleccionó una nueva imagen, mantener la existente
            const existingProject = window.projectsData.find(p => p.id === projectId);
            if (existingProject && existingProject.imagenUrl) {
                imagenUrl = existingProject.imagenUrl;
            }
        }

        // Preparar datos para la actualización
        const projectData = {
            nombre,
            descripcion,
            imagenUrl,
            fechaExpiracion,
            limiteParticipantes: participantesLimit ? parseInt(participantesLimit, 10) : null
        };

        // Enviar petición de actualización
        const response = await fetch(`${API_BASE_URL}/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });

        // Restaurar botón
        updateBtn.disabled = false;
        updateBtn.innerHTML = originalText;

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Respuesta no OK:', errorData);
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const updatedProject = await response.json();
        
        // Actualizar el proyecto en la lista global
        const index = window.projectsData.findIndex(p => p.id === projectId);
        if (index !== -1) {
            window.projectsData[index] = updatedProject;
        }
        
        // Actualizar la vista
        const existingCard = document.querySelector(`.project-admin-card[data-project-id="${projectId}"]`);
        if (existingCard) {
            existingCard.remove();
        }
        renderProjectCard(updatedProject);
        
        toggleForm(); // Cerrar modal
        showNotification('Proyecto actualizado exitosamente', 'success');
    } catch (error) {
        console.error('Error al actualizar proyecto:', error);
        alert(`Error al actualizar el proyecto: ${error.message}`);
        
        // Restaurar botón en caso de error
        const updateBtn = document.getElementById('updateProjectBtn');
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
    }
}

// Función para eliminar un proyecto
async function deleteProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${projectId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Proyecto no encontrado.');
            } else {
                const errorData = await response.text();
                console.error('Respuesta no OK:', errorData);
                throw new Error(`Error HTTP: ${response.status}`);
            }
        }

        // Eliminar la tarjeta del DOM
        const cardToRemove = document.querySelector(`.project-admin-card[data-project-id="${projectId}"]`);
        if (cardToRemove) {
            cardToRemove.remove();
        }
        
        // Si ya no quedan proyectos, mostrar mensaje
        const projectsGrid = document.querySelector('.projects-grid');
        if (projectsGrid.childElementCount === 0) {
            projectsGrid.innerHTML = '<p>No hay proyectos creados todavía.</p>';
        }
        
        // Actualizar la lista global de proyectos
        window.projectsData = window.projectsData.filter(p => p.id !== projectId);
        
        showNotification('Proyecto eliminado exitosamente', 'success');
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        alert(`Error al eliminar el proyecto: ${error.message}`);
    }
}

// Función para confirmar la eliminación de un proyecto
function confirmDeleteProject(projectId) {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) {
        deleteProject(projectId);
    }
}

// Función para buscar proyectos
function searchProjectsAdmin() {
    const searchInput = document.getElementById('adminSearchInput');
    if (!searchInput) {
        console.warn("Elemento con ID 'adminSearchInput' no encontrado para la búsqueda.");
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm.trim()) {
        // Si la búsqueda está vacía, mostrar todos los proyectos
        if (window.projectsData) {
            displayProjects(window.projectsData);
        } else {
            loadProjects(); // Cargar todos si no hay datos en memoria
        }
        return;
    }
    
    // Filtrar proyectos según el término de búsqueda
    const filteredProjects = (window.projectsData || []).filter(project =>
        (project.nombre && project.nombre.toLowerCase().includes(searchTerm)) ||
        (project.descripcion && project.descripcion.toLowerCase().includes(searchTerm))
    );
    
    // Mostrar resultados
    displayProjects(filteredProjects);
}

// Función para mostrar proyectos filtrados
function displayProjects(projects) {
    const projectsGrid = document.querySelector('.projects-grid');
    
    // Limpiar grid antes de mostrar los resultados filtrados
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
        projectsGrid.innerHTML = '<p>No se encontraron proyectos que coincidan con la búsqueda.</p>';
    } else {
        projects.forEach(project => renderProjectCard(project));
    }
}

// ======== FUNCIONES PARA DETALLES DE PROYECTOS Y PARTICIPANTES ========

// Función para ver detalles del proyecto
function viewProjectDetails(projectId) {
    // Mostrar el modal de detalles
    const modal = document.getElementById('projectDetailsModal');
    
    // Buscar el proyecto en los datos existentes
    const project = window.projectsData.find(p => p.id === projectId);
    if (!project) {
        alert('No se encontró información del proyecto.');
        return;
    }
    
    // Llenar los datos del proyecto en el modal
    document.getElementById('modalProjectName').textContent = project.nombre || 'Sin nombre';
    document.getElementById('modalProjectDescription').textContent = project.descripcion || 'Sin descripción';
    
    // Establecer imagen con fallback
    const defaultImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE1IiBmaWxsPSIjYmJiIi8+PHBvbHlnb24gcG9pbnRzPSIwLDIwMCAyMDAsMTUwIDIwMCwyMDAiIGZpbGw9IiNiYmIiLz48cGF0aCBkPSJNNjAgOTBMOTAgMTUwIDE0MCAxMTAgMTgwIDE3MCIgc3Ryb2tlPSIjYmJiIiBzdHJva2Utd2lkdGg9IjEwIiBmaWxsPSJub25lIi8+PHRleHQgeD0iNDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjODg4Ij5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
    const imagePath = project.imagenUrl ? `/static/Proyectos/${project.imagenUrl}` : defaultImageBase64;
    const imgElement = document.getElementById('modalProjectImage');
    imgElement.src = imagePath;
    imgElement.onerror = function() { this.src = defaultImageBase64; };
    
    // Establecer metadatos
    document.getElementById('modalProjectStatus').innerHTML = `<i class="fas fa-info-circle"></i> Estado: ${project.estado || 'ACTIVO'}`;
    
    const participantesInfo = project.participantesActuales !== null ?
        `${project.participantesActuales}${project.limiteParticipantes ? ' / ' + project.limiteParticipantes : ''}` :
        'N/A';
    document.getElementById('modalProjectParticipants').innerHTML = `<i class="fas fa-users"></i> ${participantesInfo} participantes`;
    
    const fechaCreacion = project.fechaCreacion ? 
        new Date(project.fechaCreacion).toLocaleDateString('es-ES') : 'Fecha desconocida';
    document.getElementById('modalProjectDate').innerHTML = `<i class="fas fa-calendar"></i> Creado: ${fechaCreacion}`;
    
    // Cargar participantes
    loadModalParticipants(projectId);
    
    // Cargar información del foro
    loadModalForum(project.foroId);
    
    // Guardar el ID del proyecto actual en el modal para referencia
    modal.dataset.projectId = projectId;
    
    // Mostrar el modal
    modal.classList.add('show');
    
    // Activar la primera pestaña por defecto
    document.querySelector('.detail-tab-btn[data-tab="participants"]').click();
}

// Función para cargar los participantes en el modal
async function loadModalParticipants(projectId) {
    const participantsGrid = document.getElementById('modalParticipantsGrid');
    participantsGrid.innerHTML = '<p>Cargando participantes...</p>';
    
    try {
        const response = await fetch(`/api/proyectos/admin/${projectId}/participantes`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const participantes = await response.json();
        
        if (participantes.length === 0) {
            participantsGrid.innerHTML = '<p>No hay participantes en este proyecto.</p>';
        } else {
            participantsGrid.innerHTML = '';
            participantes.forEach(participant => {
                const card = document.createElement('div');
                card.classList.add('participant-card');
                
                // Validar datos para evitar errores
                const nombre = participant.nombre || 'Sin nombre';
                const rol = participant.rol || 'Voluntario';
                const correo = participant.correo || '';
                
                card.innerHTML = `
                    <div class="participant-avatar">
                        ${participant.imagenPerfil ?
                        `<img src="${participant.imagenPerfil}" alt="${nombre}" onerror="this.onerror=null; this.src='/img/default-avatar.jpg';">` :
                        `<i class="fas fa-user"></i>`
                    }
                    </div>
                    <h4>${nombre}</h4>
                    <p>${rol}</p>
                    ${correo ? `<span class="email">${correo}</span>` : ''}
                `;
                
                participantsGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error al cargar participantes:', error);
        participantsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al cargar participantes: ${error.message}</p>
                <button class="retry-btn" onclick="loadModalParticipants('${projectId}')">
                    <i class="fas fa-sync"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// Función para cargar información del foro en el modal
async function loadModalForum(foroId) {
    const forumPreview = document.getElementById('modalForumPreview');
    
    if (!foroId) {
        forumPreview.innerHTML = '<p>Este proyecto no tiene un foro asociado.</p>';
        return;
    }
    
    forumPreview.innerHTML = '<p>Cargando información del foro...</p>';
    
    try {
        const response = await fetch(`/api/foros/${foroId}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const foro = await response.json();
        
        forumPreview.innerHTML = `
            <h4>${foro.titulo || 'Foro del proyecto'}</h4>
            <p>${foro.descripcion || 'Sin descripción'}</p>
            <div class="forum-stats">
                <span><i class="fas fa-comment-alt"></i> ${foro.cantidadMensajes || 0} mensajes</span>
                <span><i class="fas fa-users"></i> ${foro.cantidadParticipantes || 0} participantes</span>
            </div>
            <button class="view-forum-btn" onclick="window.location.href='/proyectos/${foro.proyectoId}/foro'">
                <i class="fas fa-external-link-alt"></i> Ir al foro
            </button>
        `;
    } catch (error) {
        console.error('Error al cargar información del foro:', error);
        forumPreview.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al cargar información del foro: ${error.message}</p>
                <button class="retry-btn" onclick="loadModalForum('${foroId}')">
                    <i class="fas fa-sync"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// Función para mostrar participantes de un proyecto
async function showParticipants(projectId) {
    const modal = document.getElementById('participantsModal');
    const participantsGrid = modal.querySelector('.participants-grid');
    participantsGrid.innerHTML = '<p>Cargando participantes...</p>';

    modal.classList.add('show');

    try {
        // Primero verificar que el proyecto exista
        const proyectoResponse = await fetch(`${API_BASE_URL}/${projectId}`);
        if (!proyectoResponse.ok) {
            throw new Error(`Error: No se pudo encontrar el proyecto (${proyectoResponse.status})`);
        }

        // Si el proyecto existe, intentar obtener los participantes
        const response = await fetch(`${API_BASE_URL}/${projectId}/participantes`);
        if (!response.ok) {
            // Manejar códigos de error específicos
            if (response.status === 404) {
                throw new Error('No se encontró el proyecto solicitado');
            } else if (response.status === 403) {
                throw new Error('No tienes permisos para ver los participantes');
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText || 'Error desconocido'}`);
            }
        }

        const participantes = await response.json();

        if (participantes.length === 0) {
            participantsGrid.innerHTML = '<p>No hay participantes en este proyecto.</p>';
        } else {
            participantsGrid.innerHTML = '';
            participantes.forEach(participant => {
                const card = document.createElement('div');
                card.classList.add('participant-card');

                // Validar datos para evitar errores
                const nombre = participant.nombre || 'Sin nombre';
                const rol = participant.rol || 'Voluntario';
                const correo = participant.correo || '';

                card.innerHTML = `
                    <div class="participant-avatar">
                        ${participant.imagenPerfil ?
                        `<img src="${participant.imagenPerfil}" alt="${nombre}" onerror="this.onerror=null; this.src='/img/default-avatar.jpg';">` :
                        `<i class="fas fa-user"></i>`
                    }
                    </div>
                    <h4>${nombre}</h4>
                    <p>${rol}</p>
                    ${correo ? `<span class="email">${correo}</span>` : ''}
                `;

                participantsGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error al cargar participantes:', error);
        participantsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al cargar participantes: ${error.message}</p>
                <button class="retry-btn" onclick="showParticipants('${projectId}')">
                    <i class="fas fa-sync"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// Función para cerrar el modal de detalles del proyecto
function closeProjectDetailsModal() {
    const modal = document.getElementById('projectDetailsModal');
    modal.classList.remove('show');
}

// Función para cerrar el modal de participantes
function closeParticipantsModal() {
    const modal = document.getElementById('participantsModal');
    modal.classList.remove('show');
}

// Función para editar el proyecto desde el modal
function editProjectFromModal() {
    const modal = document.getElementById('projectDetailsModal');
    const projectId = modal.dataset.projectId;
    
    if (!projectId) {
        alert('Error: No se pudo identificar el proyecto.');
        return;
    }
    
    // Cerrar el modal de detalles
    closeProjectDetailsModal();
    
    // Llamar a la función de edición existente
    editProject(projectId);
}

// Función para gestionar participantes desde el modal
function manageParticipantsFromModal() {
    const modal = document.getElementById('projectDetailsModal');
    const projectId = modal.dataset.projectId;
    
    if (!projectId) {
        alert('Error: No se pudo identificar el proyecto.');
        return;
    }
    
    // Cerrar el modal de detalles
    closeProjectDetailsModal();
    
    // Llamar a la función de mostrar participantes
    showParticipants(projectId);
}

// Función para confirmar eliminación desde el modal
function confirmDeleteProjectFromModal() {
    const modal = document.getElementById('projectDetailsModal');
    const projectId = modal.dataset.projectId;
    
    if (!projectId) {
        alert('Error: No se pudo identificar el proyecto.');
        return;
    }
    
    // Cerrar el modal de detalles
    closeProjectDetailsModal();
    
    // Llamar a la función de confirmación de eliminación
    confirmDeleteProject(projectId);
}

// Inicializar eventos para pestañas de detalles
document.addEventListener('DOMContentLoaded', function() {
    // Configurar pestañas del modal de detalles
    document.querySelectorAll('.detail-tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Desactivar todas las pestañas y contenidos
            document.querySelectorAll('.detail-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.project-details-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Activar la pestaña y contenido seleccionados
            this.classList.add('active');
            document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
        });
    });
});

// ======== FUNCIONES PARA GESTIÓN DE DESAFÍOS ========

// Función para mostrar/ocultar el formulario de desafíos
function toggleChallengeForm() {
    const form = document.getElementById('challengeForm');
    
    if (form.classList.contains('show')) {
        // Ocultar formulario
        form.classList.remove('show');
        form.style.display = 'none';
    } else {
        // Mostrar formulario
        form.classList.add('show');
        form.style.display = 'flex';
        
        // Inicializar formulario
        document.getElementById('newChallengeForm').reset();
        
        // Cargar proyectos
        loadProjectsForSelect();
        
        // Inicializar eventos
        initChallengeFormEvents();
        
        // Establecer fechas por defecto
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 7); // Una semana después
        
        const startDateInput = document.getElementById('challengeStartDate');
        const endDateInput = document.getElementById('challengeEndDate');
        
        if (startDateInput) {
            startDateInput.value = now.toISOString().slice(0, 16);
        }
        
        if (endDateInput) {
            endDateInput.value = tomorrow.toISOString().slice(0, 16);
        }
        
        // Restaurar título original
        const formTitle = document.querySelector('#challengeForm .modal-content h2');
        formTitle.innerHTML = '<i class="fas fa-trophy"></i> Crear Nuevo Desafío';
        
        // Mostrar botón crear y ocultar botón actualizar
        document.getElementById('createChallengeBtn').style.display = 'inline-block';
        document.getElementById('updateChallengeBtn').style.display = 'none';
        
        // Eliminar ID de desafío en edición
        delete document.getElementById('newChallengeForm').dataset.editingChallengeId;
        
        // Ocultar la vista previa de la imagen
        document.getElementById('challengePreviewImg').style.display = 'none';
    }
}

// Función para inicializar eventos del formulario de desafíos
function initChallengeFormEvents() {
    // Configurar evento para mostrar/ocultar opciones de foro
    const conditionTypeSelect = document.getElementById('challengeConditionType');
    if (conditionTypeSelect) {
        conditionTypeSelect.addEventListener('change', function() {
            const forumSelectGroup = document.getElementById('forumSelectGroup');
            
            if (this.value === 'COMENTAR_FORO') {
                if (forumSelectGroup) forumSelectGroup.style.display = 'block';
                
                // Cargar los foros disponibles
                const proyectoId = document.getElementById('challengeProject').value;
                if (proyectoId) {
                    loadForosForProject(proyectoId, 'criterioForoSelect');
                }
            } else {
                if (forumSelectGroup) forumSelectGroup.style.display = 'none';
            }
        });
    }
    
    // Configurar evento para cargar foros cuando se selecciona un proyecto
    const projectSelect = document.getElementById('challengeProject');
    if (projectSelect) {
        projectSelect.addEventListener('change', function() {
            const conditionType = document.getElementById('challengeConditionType').value;
            if (conditionType === 'COMENTAR_FORO') {
                loadForosForProject(this.value, 'criterioForoSelect');
            }
        });
    }
    
    // Configurar previsualización de imagen
    const imageInput = document.getElementById('challengeImageInput');
    const previewImg = document.getElementById('challengePreviewImg');
    
    if (imageInput && previewImg) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                }
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}

// Función para cargar los desafíos
async function loadChallenges() {
    const challengesContainer = document.querySelector('.challenges-grid');
    if (!challengesContainer) {
        console.error("No se encontró el contenedor de desafíos");
        return;
    }
    
    // Mostrar mensaje de carga
    challengesContainer.innerHTML = `
        <div class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando desafíos...</p>
        </div>
    `;
    
    try {
        // Hacer petición a la API
        const response = await fetch(CHALLENGE_API_URL + '/paginados');
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('No tienes permiso para ver los desafíos. Por favor, inicia sesión nuevamente.');
            }
            throw new Error(`Error ${response.status} al cargar desafíos`);
        }
        
        const data = await response.json();
        
        // Mostrar desafíos
        displayChallenges(data);
        
    } catch (error) {
        console.error("Error cargando desafíos:", error);
        challengesContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message}</p>
                <button onclick="loadChallenges()" class="retry-btn">
                    <i class="fas fa-sync"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// Función para cargar los foros de un proyecto
async function loadForosForProject(projectId, targetSelector = 'challengeForum') {
    const forumSelect = document.getElementById(targetSelector);
    const forumError = document.getElementById('forumError');
    
    if (!forumSelect) {
        console.error(`El selector de foro con ID '${targetSelector}' no existe`);
        return;
    }
    
    // Mostrar mensaje de carga
    forumSelect.innerHTML = '<option value="">Cargando foros...</option>';
    forumSelect.disabled = true;
    
    try {
        const response = await fetch(`/api/foros/proyecto/${projectId}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status} al cargar foros`);
        }
        
        const data = await response.json();
        forumSelect.disabled = false;
        forumSelect.innerHTML = '<option value="">Seleccione un foro</option>';
        
        // Procesar la respuesta correctamente
        let forosArray = data;
        
        // Si es un objeto paginado
        if (data && typeof data === 'object' && Array.isArray(data.content)) {
            forosArray = data.content;
        }
        
        if (!Array.isArray(forosArray) || forosArray.length === 0) {
            forumSelect.innerHTML = '<option value="">No hay foros disponibles</option>';
            if (forumError) {
                forumError.textContent = 'No hay foros disponibles para este proyecto.';
                forumError.style.display = 'block';
            }
            return;
        }
        
        if (forumError) {
            forumError.style.display = 'none';
        }
        
        forosArray.forEach(forum => {
            const option = document.createElement('option');
            option.value = forum.id;
            option.textContent = forum.titulo || forum.nombre || `Foro (ID: ${forum.id.substring(0, 8)}...)`;
            forumSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar foros:', error);
        forumSelect.disabled = false;
        forumSelect.innerHTML = '<option value="">Error al cargar foros</option>';
        
        if (forumError) {
            forumError.textContent = `Error: ${error.message}`;
            forumError.style.display = 'block';
        }
    }
}

// Función para cargar proyectos en el select del formulario
async function loadProjectsForSelect() {
    const projectSelect = document.getElementById('challengeProject');
    const projectError = document.getElementById('projectError');
    
    if (!projectSelect) {
        console.error("No se encontró el selector de proyectos");
        return;
    }
    
    // Mantener la opción "Seleccione un proyecto"
    projectSelect.innerHTML = '<option value="">Cargando proyectos...</option>';
    projectSelect.disabled = true;
    
    if (projectError) projectError.style.display = 'none';
    
    try {
        // Si ya tenemos los proyectos cargados, usarlos
        if (window.projectsData && window.projectsData.length > 0) {
            fillProjectOptions(projectSelect, window.projectsData);
        } else {
            // Si no, cargarlos desde la API
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const projects = await response.json();
            window.projectsData = projects; // Guardar para futura referencia
            fillProjectOptions(projectSelect, projects);
        }
    } catch (error) {
        console.error('Error al cargar proyectos para el select:', error);
        projectSelect.disabled = false;
        projectSelect.innerHTML = '<option value="">Error al cargar proyectos</option>';
        
        if (projectError) {
            projectError.textContent = 'Error al cargar proyectos. Por favor, recargue la página.';
            projectError.style.display = 'block';
        }
    }
}

// Función auxiliar para llenar opciones de proyectos
function fillProjectOptions(selectElement, projects) {
    selectElement.disabled = false;
    selectElement.innerHTML = '<option value="">Seleccione un proyecto</option>';
    
    if (!projects || projects.length === 0) {
        const projectError = document.getElementById('projectError');
        if (projectError) {
            projectError.textContent = 'No hay proyectos disponibles. Debe crear un proyecto primero.';
            projectError.style.display = 'block';
        }
        return;
    }
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.nombre;
        selectElement.appendChild(option);
    });
}

// Función para mostrar los desafíos en la grid
function displayChallenges(challenges) {
    const challengesContainer = document.querySelector('.challenges-grid');
    if (!challengesContainer) {
        console.error("No se encontró el contenedor de desafíos");
        return;
    }
    
    // Limpiar contenedor
    challengesContainer.innerHTML = '';
    
    // Verificar si hay datos válidos
    let challengesArray = [];
    
    if (challenges && Array.isArray(challenges)) {
        challengesArray = challenges;
    } else if (challenges && typeof challenges === 'object' && Array.isArray(challenges.content)) {
        challengesArray = challenges.content;
    }
    
    if (challengesArray.length === 0) {
        challengesContainer.innerHTML = `
            <div class="no-data">
                <i class="fas fa-exclamation-circle"></i>
                <p>No hay desafíos disponibles. ¡Crea el primero!</p>
            </div>
        `;
        return;
    }
    
    // Guardar referencia global
    challengesData = challengesArray;
    
    // Crear tarjetas de desafíos
    challengesArray.forEach((challenge, index) => {
        // Formatear fechas
        const startDate = challenge.fechaInicio ? new Date(challenge.fechaInicio).toLocaleDateString() : 'No definida';
        const endDate = challenge.fechaFin ? new Date(challenge.fechaFin).toLocaleDateString() : 'Sin límite';
        
        // Determinar estado
        const now = new Date();
        const fechaInicio = challenge.fechaInicio ? new Date(challenge.fechaInicio) : null;
        const fechaFin = challenge.fechaFin ? new Date(challenge.fechaFin) : null;
        
        let estado = "ACTIVO";
        if (fechaInicio && fechaInicio > now) {
            estado = "PENDIENTE";
        } else if (fechaFin && fechaFin < now) {
            estado = "FINALIZADO";
        }
        
        // Determinar el texto de la condición de completitud
        let condicionTexto = "Completar manualmente";
        if (challenge.tipoCondicionCompletitud === 'PARTICIPAR_PROYECTO') {
            condicionTexto = "Participar en el proyecto";
        } else if (challenge.tipoCondicionCompletitud === 'COMENTAR_FORO') {
            condicionTexto = "Comentar en el foro";
        }
        
        // Crear tarjeta
        const card = document.createElement('div');
        card.className = `challenge-card ${estado.toLowerCase()}`;
        card.innerHTML = `
            <div class="challenge-header">
                <h3>${challenge.nombre}</h3>
                <span class="challenge-points">${challenge.puntosRecompensa || 0} pts</span>
            </div>
            <p class="challenge-description">${challenge.descripcion || ''}</p>
            <div class="challenge-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar-alt"></i> ${startDate} - ${endDate}
                </div>
                <div class="meta-item">
                    <i class="fas fa-users"></i> ${challenge.tipo || 'Individual'}
                </div>
                <div class="meta-item">
                    <i class="fas fa-check-circle"></i> ${condicionTexto}
                </div>
                <div class="meta-item">
                    <i class="fas fa-info-circle"></i> ${estado}
                </div>
            </div>
            <div class="challenge-actions">
                <button class="action-btn view-btn" onclick="viewChallengeDetails('${challenge.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" onclick="editChallenge('${challenge.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="confirmDeleteChallenge('${challenge.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        challengesContainer.appendChild(card);
        
        // Animar entrada
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Función para buscar desafíos
function searchChallenges() {
    const searchInput = document.getElementById('challengeSearchInput');
    if (!searchInput) {
        console.warn("Elemento con ID 'challengeSearchInput' no encontrado para la búsqueda.");
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm.trim()) {
        // Si la búsqueda está vacía, mostrar todos los desafíos
        displayChallenges(challengesData);
        return;
    }
    
    // Filtrar desafíos según el término de búsqueda
    const filteredChallenges = challengesData.filter(challenge =>
        (challenge.nombre && challenge.nombre.toLowerCase().includes(searchTerm)) ||
        (challenge.descripcion && challenge.descripcion.toLowerCase().includes(searchTerm))
    );
    
    // Mostrar resultados
    displayChallenges(filteredChallenges);
}

// Función para crear un nuevo desafío
async function createChallenge(event) {
    event.preventDefault();
    
    // Mostrar indicador de carga
    const submitBtn = document.getElementById('createChallengeBtn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    // Obtener valores del formulario
    const nombre = document.getElementById('challengeName').value;
    const descripcion = document.getElementById('challengeDescription').value;
    const puntosRecompensa = parseInt(document.getElementById('challengeRewardPoints').value) || 10;
    const tipo = document.getElementById('challengeType').value;
    const proyectoId = document.getElementById('challengeProject').value;
    const fechaInicio = document.getElementById('challengeStartDate').value;
    const fechaFin = document.getElementById('challengeEndDate').value;
    
    // Obtener el tipo de condición de completitud seleccionado
    const tipoCondicionCompletitud = document.getElementById('challengeConditionType').value;
    
    // Determinar el objetivoId según el tipo de condición
    let objetivoId = proyectoId; // Por defecto, el objetivo es el proyecto
    
    if (tipoCondicionCompletitud === 'COMENTAR_FORO') {
        // Si la condición es comentar en foro, el objetivo es el foro seleccionado
        const foroSelectElement = document.getElementById('criterioForoSelect');
        if (foroSelectElement && foroSelectElement.value) {
            objetivoId = foroSelectElement.value;
        } else {
            // Si no hay foro seleccionado, mostrar error
            showNotification('Para la condición "Comentar en foro" debes seleccionar un foro.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
    }
    
    // Validaciones básicas
    if (!nombre || !proyectoId || !fechaInicio || !fechaFin) {
        showNotification('Por favor completa todos los campos obligatorios.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return;
    }
    
    // Construir objeto de desafío
    const desafioData = {
        nombre: nombre,
        descripcion: descripcion,
        puntosRecompensa: puntosRecompensa,
        tipo: tipo,
        proyectoId: proyectoId,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: new Date(fechaFin).toISOString(),
        tipoCondicionCompletitud: tipoCondicionCompletitud,
        objetivoId: objetivoId
    };
    
    console.log('Enviando datos del desafío:', desafioData);
    
    try {
        // Enviar datos al servidor
        const response = await fetch(CHALLENGE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(desafioData)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        showNotification('Desafío creado con éxito', 'success');
        
        // Cerrar formulario y recargar desafíos
        toggleChallengeForm();
        loadChallenges();
        
    } catch (error) {
        console.error('Error al crear desafío:', error);
        showNotification(`Error al crear desafío: ${error.message}`, 'error');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Función para confirmar eliminación de un desafío
function confirmDeleteChallenge(challengeId) {
    if (confirm('¿Estás seguro de que deseas eliminar este desafío? Esta acción no se puede deshacer.')) {
        deleteChallenge(challengeId);
    }
}

// Función para eliminar un desafío
async function deleteChallenge(challengeId) {
    try {
        const response = await fetch(`${CHALLENGE_API_URL}/${challengeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        // Eliminar el desafío de la lista
        challengesData = challengesData.filter(challenge => challenge.id !== challengeId);
        
        // Actualizar la vista
        displayChallenges(challengesData);
        
        // Mostrar mensaje de éxito
        showNotification('Desafío eliminado correctamente', 'success');
        
    } catch (error) {
        console.error('Error al eliminar desafío:', error);
        showNotification(`Error al eliminar el desafío: ${error.message}`, 'error');
    }
}

// Función para editar un desafío
function editChallenge(challengeId) {
    // Buscar el desafío en la lista
    const challenge = challengesData.find(c => c.id === challengeId);
    if (!challenge) {
        alert('Desafío no encontrado');
        return;
    }
    
    // Mostrar formulario
    toggleChallengeForm();
    
    // Rellenar el formulario con los datos del desafío
    document.getElementById('challengeName').value = challenge.nombre || '';
    document.getElementById('challengeDescription').value = challenge.descripcion || '';
    document.getElementById('challengeRewardPoints').value = challenge.puntosRecompensa || 0;
    
    // Asegurar que tenemos un tipo válido
    let tipoDesafio = challenge.tipo || 'INDIVIDUAL';
    // Sanitizar el tipo para que coincida con las opciones disponibles
    if (!['INDIVIDUAL', 'GRUPAL', 'COMPETITIVO'].includes(tipoDesafio.toUpperCase())) {
        tipoDesafio = 'INDIVIDUAL';
    }
    document.getElementById('challengeType').value = tipoDesafio;
    
    // Establecer fechas si existen
    if (challenge.fechaInicio) {
        // Formatear la fecha para el input datetime-local
        const startDate = new Date(challenge.fechaInicio);
        const formattedStartDate = startDate.toISOString().slice(0, 16);
        document.getElementById('challengeStartDate').value = formattedStartDate;
    }
    
    if (challenge.fechaFin) {
        // Formatear la fecha para el input datetime-local
        const endDate = new Date(challenge.fechaFin);
        const formattedEndDate = endDate.toISOString().slice(0, 16);
        document.getElementById('challengeEndDate').value = formattedEndDate;
    }
    
    // Seleccionar proyecto asociado si existe
    if (challenge.proyectoId) {
        document.getElementById('challengeProject').value = challenge.proyectoId;
        // Cargar foros del proyecto
        loadForosForProject(challenge.proyectoId);
    }
    
    // Establecer tipo de condición
    if (challenge.tipoCondicionCompletitud) {
        document.getElementById('challengeConditionType').value = challenge.tipoCondicionCompletitud;
        
        // Si la condición es comentar en foro, mostrar selección de foro
        if (challenge.tipoCondicionCompletitud === 'COMENTAR_FORO') {
            const forumSelectGroup = document.getElementById('forumSelectGroup');
            if (forumSelectGroup) forumSelectGroup.style.display = 'block';
            
            // Cargar los foros y esperar para seleccionar el correcto
            setTimeout(() => {
                const criterioForoSelect = document.getElementById('criterioForoSelect');
                if (criterioForoSelect && challenge.objetivoId) {
                    criterioForoSelect.value = challenge.objetivoId;
                }
            }, 1000);
        }
    }
    
    // Mostrar vista previa de imagen si existe
    if (challenge.imagenUrl) {
        const previewImg = document.getElementById('challengePreviewImg');
        previewImg.src = `/static/Desafios/${challenge.imagenUrl}`;
        previewImg.style.display = 'block';
    }
    
    // Cambiar título del formulario
    document.querySelector('#challengeForm .modal-content h2').innerHTML = '<i class="fas fa-trophy"></i> Editar Desafío';
    
    // Mostrar botón de actualizar y ocultar botón de crear
    document.getElementById('createChallengeBtn').style.display = 'none';
    document.getElementById('updateChallengeBtn').style.display = 'inline-block';
    
    // Guardar ID del desafío en edición
    document.getElementById('newChallengeForm').dataset.editingChallengeId = challengeId;
}

// Función para actualizar un desafío
async function updateChallenge(event) {
    event.preventDefault();
    
    const challengeId = document.getElementById('newChallengeForm').dataset.editingChallengeId;
    if (!challengeId) {
        alert('Error: No se pudo identificar el desafío a actualizar');
        return;
    }
    
    // Mostrar indicador de carga
    const updateBtn = document.getElementById('updateChallengeBtn');
    const originalText = updateBtn.innerHTML;
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
    
    // Obtener valores del formulario
    const nombre = document.getElementById('challengeName').value;
    const descripcion = document.getElementById('challengeDescription').value;
    const puntosRecompensa = parseInt(document.getElementById('challengeRewardPoints').value) || 10;
    const tipo = document.getElementById('challengeType').value;
    const proyectoId = document.getElementById('challengeProject').value;
    const fechaInicio = document.getElementById('challengeStartDate').value;
    const fechaFin = document.getElementById('challengeEndDate').value;
    const tipoCondicionCompletitud = document.getElementById('challengeConditionType').value;
    const imageInput = document.getElementById('challengeImageInput');
    
    // Determinar el objetivoId según el tipo de condición
    let objetivoId = proyectoId; // Por defecto, el objetivo es el proyecto
    
    if (tipoCondicionCompletitud === 'COMENTAR_FORO') {
        // Si la condición es comentar en foro, el objetivo es el foro seleccionado
        const foroSelectElement = document.getElementById('criterioForoSelect');
        if (foroSelectElement && foroSelectElement.value) {
            objetivoId = foroSelectElement.value;
        } else {
            // Si no hay foro seleccionado, mostrar error
            showNotification('Para la condición "Comentar en foro" debes seleccionar un foro.', 'error');
            updateBtn.disabled = false;
            updateBtn.innerHTML = originalText;
            return;
        }
    }
    
    // Validaciones básicas
    if (!nombre || !proyectoId || !fechaInicio || !fechaFin) {
        showNotification('Por favor completa todos los campos obligatorios.', 'error');
        updateBtn.disabled = false;
        updateBtn.innerHTML = originalText;
        return;
    }
    
    try {
        // Subir imagen nueva si se seleccionó una
        let imageUrl = null;
        if (imageInput.files && imageInput.files[0]) {
            const formData = new FormData();
            formData.append('imagen', imageInput.files[0]);
            
            const imageResponse = await fetch(CHALLENGE_UPLOAD_URL, {
                method: 'POST',
                body: formData
            });
            
            if (!imageResponse.ok) {
                throw new Error('Error al subir la imagen');
            }
            
            const imageResult = await imageResponse.json();
            imageUrl = imageResult.nombreArchivo;
        } else {
            // Si no se seleccionó una nueva imagen, mantener la existente
            const existingChallenge = challengesData.find(c => c.id === challengeId);
            if (existingChallenge && existingChallenge.imagenUrl) {
                imageUrl = existingChallenge.imagenUrl;
            }
        }
        
        // Preparar datos del desafío
        const challengeData = {
            nombre: nombre,
            descripcion: descripcion,
            puntosRecompensa: puntosRecompensa,
            imagenUrl: imageUrl,
            fechaInicio: new Date(fechaInicio).toISOString(),
            fechaFin: new Date(fechaFin).toISOString(),
            proyectoId: proyectoId,
            tipo: tipo,
            tipoCondicionCompletitud: tipoCondicionCompletitud,
            objetivoId: objetivoId
        };
        
        // Enviar datos a la API
        const response = await fetch(`${CHALLENGE_API_URL}/${challengeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include', // Incluir cookies para autenticación
            body: JSON.stringify(challengeData)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const updatedChallenge = await response.json();
        
        // Actualizar la lista de desafíos
        const index = challengesData.findIndex(c => c.id === challengeId);
        if (index !== -1) {
            challengesData[index] = updatedChallenge;
        }
        
        displayChallenges(challengesData);
        
        // Cerrar el formulario
        toggleChallengeForm();
        
        // Mostrar mensaje de éxito
        showNotification('Desafío actualizado correctamente', 'success');
        
    } catch (error) {
        console.error('Error al actualizar desafío:', error);
        showNotification(`Error al actualizar el desafío: ${error.message}`, 'error');
    } finally {
        // Restaurar el botón
        updateBtn.disabled = false;
        updateBtn.innerHTML = originalText;
    }
}

// Función para ver detalles de un desafío
function viewChallengeDetails(challengeId) {
    // Buscar el desafío en la lista
    const challenge = challengesData.find(c => c.id === challengeId);
    if (!challenge) {
        alert('Desafío no encontrado');
        return;
    }
    
    // Por ahora, solo mostrar un alert con la información básica
    // En una versión futura, se podría implementar un modal similar al de proyectos
    alert(`
        Título: ${challenge.nombre || challenge.titulo || 'Sin título'}
        Descripción: ${challenge.descripcion || 'Sin descripción'}
        Puntos: ${challenge.puntosRecompensa || challenge.puntos || 0}
        Tipo: ${challenge.tipo || 'INDIVIDUAL'}
        Fechas: ${new Date(challenge.fechaInicio).toLocaleDateString()} - ${new Date(challenge.fechaFin).toLocaleDateString()}
    `);
}

// Agregar listener para la pestaña de desafíos
document.addEventListener('DOMContentLoaded', function() {
    const challengesTab = document.querySelector('.tab-btn[data-tab="challenges"]');
    if (challengesTab) {
        challengesTab.addEventListener('click', function() {
            loadChallenges();
        });
    }
});

// Función para verificar proyectos expirados manualmente
async function verificarProyectosExpirados() {
    // Mostrar indicador de carga
    const btn = document.querySelector('.check-expired-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    
    try {
        const response = await fetch('/api/proyectos/admin/verificar-expirados');
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText || 'Error desconocido'}`);
        }
        
        const result = await response.json();
        
        // Mostrar notificación con el resultado
        showNotification(`Verificación completada: ${result.proyectosActualizados} proyectos actualizados a estado COMPLETADO`, 'success');
        
        // Recargar la lista de proyectos para mostrar los cambios
        loadProjects();
        
    } catch (error) {
        console.error("Error al verificar proyectos con fecha cumplida:", error);
        showNotification(`Error al verificar proyectos con fecha cumplida: ${error.message}`, 'error');
    } finally {
        // Restaurar botón
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
