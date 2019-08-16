'use strict'; 
//--->shop_cart_func
//! Реализовать хранение товаров в coockies или localStorage

function functioanl_cart(){
    const cards_wrapper = document.querySelector('.goods'),
    cart_wrapper = document.querySelector('.cart-wrapper'),
    cart_empty = document.getElementById('cart-empty'),
    card_count = document.querySelector('.counter'),
    cart_total_price = document.querySelector('.cart-total span'),
    btn_cart = document.getElementById('cart'),
    modal_cart = document.querySelector('.cart'),
    close_cart = document.querySelector('.cart-close');

    class Active_Cart{
        constructor(cart){
            this._cart = cart;
            this.total_price = parseFloat(cart_total_price.textContent);
            cart.onclick = this.track_card.bind(this);
        }
        track_card(event){
            let btn = event.target.closest('.btn'),
                card = event.target.closest('.card');
            if (!btn) return;
            this.remove_card(card);
        }
        add_card(card){
            this.total_price += parseFloat(card.querySelector('.card-price').textContent);
            let remove_btn = card.querySelector('.btn');
            remove_btn.textContent = "Удалить из корзины";
            remove_btn.classList.add('remove');
            this._cart.appendChild(card);
            this.check_length();
            this.count_cost(this.total_price);
        }
        remove_card(card){
            this.total_price -= parseFloat(card.querySelector('.card-price').textContent);
            card.remove();
            this.check_length();
            this.count_cost(this.total_price);
        }
        check_length(){
            let l = this._cart.children.length;
            card_count.textContent = l-1;
            if(l > 1)
                cart_empty.style.display = 'none';
            else 
                cart_empty.style.display = '';
        }
        count_cost(price){
            cart_total_price.textContent = price
        }
    }

    const active_cart = new Active_Cart(cart_wrapper);

    cards_wrapper.onclick = function(event){
        let btn = event.target.closest('.btn'),
            card = event.target.closest('.card');
        if (!btn) return;
        move_to_cart(card);
    }
    function move_to_cart(card){
        let card_clone = card.cloneNode(true);
        active_cart.add_card(card_clone);
    }

    btn_cart.addEventListener('click', () => {
        modal_cart.classList.add('active');
    });
    close_cart.addEventListener('click', () => {
        modal_cart.classList.remove('active');
    });
}
//---<end shop_cart_func

//--->filter_discount

function filter_n_search(){
    const cards = document.querySelectorAll('.goods .card'),
    discount_chkbox = document.getElementById('discount-checkbox'),
    min = document.getElementById('min'),
    max = document.getElementById('max'),
    search = document.querySelector('.search-wrapper_input'),
    search_btn = document.querySelector('.search-btn');

    discount_chkbox.addEventListener('click',filter);
    min.addEventListener('change', filter); 
    max.addEventListener('change', filter);

    function filter (){
        cards.forEach((card)=>{
            let card_price = card.querySelector('.card-price'),
                price = parseFloat(card_price.textContent),
                discount = card.querySelector('.card-sale');
            if ((min.value && price < min.value) || (max.value && price > max.value))
                card.parentNode.classList.add('hidden'); 
            else if (discount_chkbox.checked && !discount)
                card.parentNode.classList.add('hidden'); 
            else 
                card.parentNode.classList.remove('hidden'); 
        });
    }

    search_btn.addEventListener('click', () => {
        let search_txt = new RegExp(search.value.trim(), 'i');
        cards.forEach((card)=>{
            if (search.value === '')
                card.parentNode.classList.remove('search_hidden'); 
            else {
                let title = card.querySelector('.card-title');
                if(search_txt.test(title.textContent))
                    card.parentNode.classList.remove('search_hidden'); 
                else
                    card.parentNode.classList.add('search_hidden'); 
            }
        });
    });
}

//---<end filter_discount


//--->load_data

function load_data(){
    const cards_wrapper = document.querySelector('.goods');
    return fetch('db/db.json')
        .then((response) => {
            if (response.ok){
                return response.json();
            }
            else {
                throw new Error ('Данные не были получены, код ошибки: ' + response.status);
            } 
        })
        .then((data)=>{return data;})
        .catch((err) => {
            console.warn(err);
            cards_wrapper.innerHTML = '<div style="color: red; font-size: 20px;">Oops, something went wrong!</div>'
        });
}

function render_data(data){
    const cards_wrapper = document.querySelector('.goods');
    data.goods.forEach((good) => {
        let card = document.createElement('div');
        card.className = 'col-12 col-md-6 col-lg-4 col-xl-3';
        card.innerHTML = `
            <div class="card" data-category="${good.category}">
                ${good.sale ? '<div class="card-sale">🔥Hot Sale🔥</div>' : ''}
                <div class="card-img-wrapper">
                    <span class="card-img-top"style="background-image: url('${good.img}')"></span>
                </div>
                    <div class="card-body justify-content-between">
                    <div class="card-price">${good.price} ₽</div>
                    <h5 class="card-title">${good.title}</h5>
                    <button class="btn btn-primary">В корзину</button>
                </div>
            </div>
        `;
        cards_wrapper.appendChild(card);
    });
}
//---<end load_data


//--->catalog

function render_catalog(){
    const cards = document.querySelectorAll('.goods .card'),
    catalog_wrap = document.querySelector('.catalog'),
    catalog_list = document.querySelector('.catalog-list'),
    catalog_btn = document.querySelector('.catalog-button'),
    category = new Set();

    cards.forEach((card) => {
        category.add(card.dataset.category);
        
    });
    category.forEach((el) => {
        let li = document.createElement('li');
        li.textContent = el;
        catalog_list.appendChild(li);
    });
    let li = document.createElement('li');
    li.innerHTML = `Сбросить`;
    catalog_list.appendChild(li);

    catalog_btn.addEventListener('click', (event) => {
        catalog_wrap.classList.contains('active') ? catalog_wrap.classList.remove('active') : catalog_wrap.classList.add('active');;
    });

    catalog_list.onclick = function(event){
        let li = event.target.closest('li').textContent;
        if (!li) return;
        category_sort(li);
    }
    function category_sort(li){
        cards.forEach((card) => {
                if (li === 'Сбросить'){
                    card.parentNode.classList.remove('category_hidden'); 
                } else if(card.dataset.category === li)
                    card.parentNode.classList.remove('category_hidden'); 
                else 
                    card.parentNode.classList.add('category_hidden'); 
        });    
    }
}

//---<end catalog

load_data().then((data) => {
    render_data(data);
    functioanl_cart();
    filter_n_search();
    render_catalog();
});
