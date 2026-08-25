-- LocalMat 커머스 MVP — Supabase 스키마
-- MVP 데모는 로컬 샘플 데이터(src/lib/data)로 동작하며,
-- 실서비스 전환 시 이 스키마로 Supabase 테이블을 생성하고
-- 데이터 레이어(src/lib/data, src/lib/store)를 Supabase 쿼리로 교체합니다.

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  emoji text
);

create table farms (
  id text primary key,
  slug text unique not null,
  name text not null,
  region text not null,
  owner text not null,
  items text[] not null default '{}',
  quote text,
  intro text,
  method text,
  story text[],
  since int,
  certifications text[],
  image_url text
);

create table products (
  id text primary key,
  slug text unique not null,
  name text not null,
  unit text not null,
  category_id text not null references categories(id),
  farm_id text not null references farms(id),
  region text not null,
  price int not null check (price >= 0),
  original_price int,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  badges text[] not null default '{}',
  stock int not null default 0,
  sales_count int not null default 0,
  is_seasonal boolean not null default false,
  options jsonb,
  summary text,
  description text[],
  storage_tip text,
  shipping_note text,
  image_url text,
  created_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_id text not null references products(id),
  option_label text,
  quantity int not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, option_label)
);

create type order_status as enum ('pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled');

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid not null references users(id),
  status order_status not null default 'pending',
  items_total int not null,
  shipping_fee int not null default 0,
  coupon_discount int not null default 0,
  total_amount int not null,
  payment_method text not null,
  recipient text not null,
  phone text not null,
  address text not null,
  request_note text,
  expected_delivery date,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text not null references products(id),
  name text not null,
  unit text,
  option_label text,
  quantity int not null,
  price int not null
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  user_id uuid references users(id),
  author text not null,
  rating int not null check (rating between 1 and 5),
  content text not null,
  created_at timestamptz not null default now()
);

create table favorites (
  user_id uuid not null references users(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text not null,
  recipient text not null,
  phone text not null,
  zip text,
  address1 text not null,
  address2 text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table coupons (
  id text primary key,
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'amount')),
  value int not null,
  min_order int not null default 0,
  max_discount int,
  expires_at date
);

create index idx_products_category on products(category_id);
create index idx_products_farm on products(farm_id);
create index idx_orders_user on orders(user_id);
create index idx_reviews_product on reviews(product_id);
