// El enfoque modular: encapsulamos toda la lógica en un objeto global App
const App = {
    // 1. ESTADO DE LA APLICACIÓN (Simula un Pinia Store)
    state: {
        products: [
            { id: 1, name: 'Cerveza Lager', desc: 'Refrescante cerveza clara', img: 'https://images.unsplash.com/photo-1601007870719-f55a108a73a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', retailPrice: 150, wholesalePrice: 120, stock: 50 },
            { id: 2, name: 'Vino Tinto', desc: 'Vino tinto reserva 750ml', img: 'https://images.unsplash.com/photo-1597405260515-5853b05a761e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', retailPrice: 800, wholesalePrice: 650, stock: 30 },
            { id: 3, name: 'Agua Mineral', desc: 'Agua natural sin gas 1.5L', img: 'https://images.unsplash.com/photo-1605372433065-27a37171d18f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', retailPrice: 50, wholesalePrice: 40, stock: 100 },
            { id: 4, name: 'Jugo Natural Naranja', desc: 'Jugo de naranja exprimido 1L', img: 'https://images.unsplash.com/photo-1600271732559-67d710ce1c8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', retailPrice: 180, wholesalePrice: 150, stock: 40 },
            { id: 5, name: 'Gaseosa Cola', desc: 'Gaseosa sabor cola 2.25L', img: 'https://images.unsplash.com/photo-1579782509177-d46e25774a3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', retailPrice: 120, wholesalePrice: 100, stock: 60 },
            { id: 6, name: 'Cerveza Artesanal IPA', desc: 'IPA con notas cítricas 500ml', img: 'https://images.unsplash.com/photo-1596707328630-f8f946e38234?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', retailPrice: 250, wholesalePrice: 200, stock: 25 },
        ],
        cart: [],
        clientType: 'retail', // 'retail' o 'wholesale'
        carousel: {
            currentSlide: 0,
            interval: null,
            slidesElement: document.getElementById('hero-slides'),
            totalSlides: 0 
        }
    },

    // 2. LÓGICA DEL CARRUSEL (Componente aislado)
    carousel: {
        init() {
            const state = App.state.carousel;
            state.slidesElement = document.getElementById('hero-slides');
            state.totalSlides = state.slidesElement ? state.slidesElement.children.length : 0;
            
            if (state.totalSlides > 0) {
                this.showSlide(state.currentSlide); 
                this.startInterval();
            }
        },
        showSlide(index) {
            const state = App.state.carousel;
            if (state.slidesElement) {
                // El 100% de movimiento es por cada slide que debe moverse
                state.slidesElement.style.transform = `translateX(-${index * 100}%)`;
            }
        },
        nextSlide() {
            const state = App.state.carousel;
            state.currentSlide = (state.currentSlide + 1) % state.totalSlides;
            this.showSlide(state.currentSlide);
        },
        startInterval() {
            const state = App.state.carousel;
            if (state.interval) {
                clearInterval(state.interval);
            }
            state.interval = setInterval(() => this.nextSlide(), 5000);
        }
    },

    // 3. FUNCIONES DE RENDERIZADO (Reactividad simulada)
    renderBestsellers() {
        const container = document.getElementById('bestsellers-container');
        if (!container) return; 

        container.innerHTML = '';
        App.state.products.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product-card';
            
            const price = App.state.clientType === 'retail' ? p.retailPrice : p.wholesalePrice;
            
            div.innerHTML = `
                <img src="${p.img}" alt="${p.name}" loading="lazy">
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <p class="price">$${price.toFixed(2)}</p>
                <p>Stock: ${p.stock}</p>
                <button onclick="App.addToCart(${p.id})">Agregar al Carrito</button>
            `;
            container.appendChild(div);
        });
    },

    renderCart() {
        const { cart, products, clientType } = App.state;
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        const cartCountSpan = document.getElementById('cart-count');

        if (!cartItemsContainer || !cartTotalSpan || !cartCountSpan) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío</p>';
        } else {
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const itemPrice = clientType === 'retail' ? product.retailPrice : product.wholesalePrice;
                    const subtotal = itemPrice * item.quantity;
                    total += subtotal;
                    count += item.quantity;

                    const div = document.createElement('div');
                    div.className = 'cart-item';
                    div.innerHTML = `
                        <p>${product.name} x ${item.quantity} = $${subtotal.toFixed(2)}</p>
                        <button onclick="App.removeFromCart(${product.id})" class="btn-secondary">Quitar</button>
                    `;
                    cartItemsContainer.appendChild(div);
                }
            });
        }

        cartTotalSpan.textContent = total.toFixed(2);
        cartCountSpan.textContent = count;
    },

    renderAdminProducts() {
        const adminProductsContainer = document.getElementById('admin-products');
        if (!adminProductsContainer) return;

        adminProductsContainer.innerHTML = '';
        App.state.products.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.innerHTML = `
                ${p.name} - Minorista: $${p.retailPrice.toFixed(2)} / Mayorista: $${p.wholesalePrice.toFixed(2)} / Stock: ${p.stock}
                <button onclick="App.editProduct(${p.id})" class="edit-btn">Editar</button>
                <button onclick="App.deleteProduct(${p.id})" class="delete-btn">Borrar</button>
            `;
            adminProductsContainer.appendChild(div);
        });
    },

    // 4. FUNCIONES DE INTERACCIÓN (Acciones y Mutaciones)
    toggleMobileMenu() {
        const navLinks = document.getElementById('nav-links');
        if (navLinks) {
            navLinks.classList.toggle('active');
        }
    },

    toggleClientType() {
        App.state.clientType = App.state.clientType === 'retail' ? 'wholesale' : 'retail';
        document.getElementById('client-type').textContent = App.state.clientType === 'retail' ? 'Minorista' : 'Mayorista';
        App.renderBestsellers(); 
        App.renderCart(); 
    },

    addToCart(productId) {
        const product = App.state.products.find(p => p.id === productId);
        if (!product || product.stock <= 0) {
            alert('Producto agotado!');
            return;
        }

        const cartItem = App.state.cart.find(item => item.productId === productId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            App.state.cart.push({ productId, quantity: 1 });
        }
        
        product.stock--; 
        App.renderBestsellers(); 
        App.renderCart();
    },

    removeFromCart(productId) {
        const product = App.state.products.find(p => p.id === productId);
        if (!product) return;

        const itemIndex = App.state.cart.findIndex(item => item.productId === productId);
        if (itemIndex > -1) {
            product.stock += App.state.cart[itemIndex].quantity; 
            App.state.cart.splice(itemIndex, 1);
        }
        App.renderBestsellers(); 
        App.renderCart();
    },

    openCart() {
        document.getElementById('cart-panel').classList.add('open');
        document.getElementById('cart-overlay').classList.add('active');
    },

    closeCart() {
        document.getElementById('cart-panel').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('active');
    },

    checkout() {
        if (App.state.cart.length === 0) {
            alert('Tu carrito está vacío!');
            return;
        }
        const total = document.getElementById('cart-total').textContent;
        alert(`Gracias por tu compra! Total: $${total}. Tu pedido ha sido procesado.`);
        App.state.cart = []; 
        App.renderBestsellers(); 
        App.renderCart(); 
        App.closeCart();
    },

    // 5. FUNCIONES DE ADMINISTRACIÓN (CRUD)
    showAdminPanel() {
        const password = prompt("Introduce la contraseña de Admin:");
        if (password === "admin123") { 
            document.getElementById('admin-panel').style.display = 'block';
            App.renderAdminProducts();
        } else if (password !== null) {
            alert("Contraseña incorrecta.");
        }
    },

    closeAdmin() {
        document.getElementById('admin-panel').style.display = 'none';
    },

    addProduct() {
        const name = document.getElementById('new-product-name').value;
        const desc = document.getElementById('new-product-desc').value;
        const retailPrice = parseFloat(document.getElementById('new-product-retail').value);
        const wholesalePrice = parseFloat(document.getElementById('new-product-wholesale').value);
        const stock = parseInt(document.getElementById('new-product-stock').value);

        if (name && desc && !isNaN(retailPrice) && !isNaN(wholesalePrice) && !isNaN(stock)) {
            const newId = App.state.products.length ? Math.max(...App.state.products.map(p => p.id)) + 1 : 1;
            App.state.products.push({ id: newId, name, desc, img: 'https://via.placeholder.com/300x200', retailPrice, wholesalePrice, stock }); 
            alert('Producto agregado!');
            
            // Limpiar formulario y re-renderizar
            document.getElementById('new-product-name').value = '';
            document.getElementById('new-product-desc').value = '';
            document.getElementById('new-product-retail').value = '';
            document.getElementById('new-product-wholesale').value = '';
            document.getElementById('new-product-stock').value = '';
            
            App.renderBestsellers();
            App.renderAdminProducts();
        } else {
            alert('Por favor, completa todos los campos para agregar un producto.');
        }
    },

    editProduct(id) {
        const product = App.state.products.find(p => p.id === id);
        if (!product) return;

        const newName = prompt(`Editar nombre de ${product.name}:`, product.name);
        if (newName === null) return; 

        const newRetailPrice = parseFloat(prompt(`Editar precio minorista:`, product.retailPrice));
        if (isNaN(newRetailPrice)) return;

        product.name = newName;
        product.retailPrice = newRetailPrice;

        alert('Producto actualizado!');
        App.renderBestsellers();
        App.renderAdminProducts();
    },

    deleteProduct(id) {
        if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
            App.state.products = App.state.products.filter(p => p.id !== id);
            alert('Producto eliminado!');
            App.renderBestsellers();
            App.renderAdminProducts();
        }
    },

    // 6. INICIALIZACIÓN
    init() {
        this.renderBestsellers();
        this.renderCart(); 
        this.carousel.init();
    }
};

// Punto de entrada de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
