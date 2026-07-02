#!/usr/bin/env python3
"""
Comprehensive backend API test for Hexpose! Next.js backend
Tests all routes under /api with external base URL
"""
import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://neon-apothecary.preview.emergentagent.com/api"
ADMIN_PASSWORD = "hexpose2025"

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.admin_cookie = None
        self.test_product_id = None
        self.test_category_id = None
        self.original_hero_headline = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        prefix = {
            "INFO": "ℹ️",
            "PASS": "✅",
            "FAIL": "❌",
            "WARN": "⚠️"
        }.get(level, "•")
        print(f"{prefix} {message}")
        
    def test(self, name: str, condition: bool, details: str = ""):
        """Record test result"""
        if condition:
            self.passed += 1
            self.log(f"PASS: {name}", "PASS")
            if details:
                print(f"   {details}")
        else:
            self.failed += 1
            self.log(f"FAIL: {name}", "FAIL")
            if details:
                print(f"   {details}")
        print()
        
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with optional admin cookie"""
        url = f"{BASE_URL}{endpoint}"
        headers = kwargs.pop('headers', {})
        use_admin = kwargs.pop('use_admin', False)
        
        if use_admin and self.admin_cookie:
            headers['Cookie'] = self.admin_cookie
            
        try:
            response = requests.request(method, url, headers=headers, timeout=30, **kwargs)
            return response
        except requests.exceptions.Timeout as e:
            self.log(f"Request timeout: {e}", "WARN")
            return None
        except requests.exceptions.ConnectionError as e:
            self.log(f"Connection error: {e}", "WARN")
            return None
        except Exception as e:
            self.log(f"Request failed: {e}", "WARN")
            return None

    def run_all_tests(self):
        """Execute all test suites"""
        print("=" * 80)
        print("HEXPOSE! BACKEND API TEST SUITE")
        print("=" * 80)
        print(f"Base URL: {BASE_URL}")
        print(f"Admin Password: {ADMIN_PASSWORD}")
        print("=" * 80)
        print()
        
        # Test suites in order
        self.test_1_health_and_seed()
        self.test_2_product_filters()
        self.test_3_admin_auth()
        self.test_4_product_mutations()
        self.test_5_categories_mutations()
        self.test_6_hero_put()
        self.test_7_branding_put()
        self.test_8_newsletter_contact()
        self.test_9_admin_overview()
        self.test_10_logout()
        
        # Summary
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"Total: {self.passed + self.failed}")
        print("=" * 80)
        
        return self.failed == 0

    def test_1_health_and_seed(self):
        """Test 1: Health / Seed endpoints"""
        print("\n" + "=" * 80)
        print("TEST 1: HEALTH / SEED")
        print("=" * 80 + "\n")
        
        # GET /api/root
        self.log("Testing GET /api/root")
        resp = self.make_request('GET', '/root')
        if resp is not None and resp.status_code == 200:
            data = resp.json()
            self.test(
                "GET /api/root returns correct response",
                data.get('message') == 'Hexpose API' and data.get('ok') == True,
                f"Response: {data}"
            )
        else:
            self.test("GET /api/root returns correct response", False, 
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # GET /api/products (no auth) - should return 4 seeded products
        self.log("Testing GET /api/products (seeded data)")
        resp = self.make_request('GET', '/products')
        if resp is not None and resp.status_code == 200:
            products = resp.json()
            has_4_products = len(products) == 4
            
            # Check first product structure
            required_fields = [
                'id', 'name', 'slug', 'category', 'description', 'rich_description',
                'price', 'compare_at_price', 'sku', 'inventory', 'hero_image',
                'gallery_images', 'featured', 'bestseller', 'new_arrival',
                'limited_edition', 'active', 'seo_title', 'seo_description',
                'spell', 'created_at', 'updated_at'
            ]
            
            has_all_fields = True
            no_mongo_id = True
            
            if products:
                first_product = products[0]
                missing_fields = [f for f in required_fields if f not in first_product]
                has_all_fields = len(missing_fields) == 0
                no_mongo_id = '_id' not in first_product
                
                self.test(
                    "GET /api/products returns exactly 4 seeded products",
                    has_4_products,
                    f"Found {len(products)} products"
                )
                
                self.test(
                    "Products have all required fields",
                    has_all_fields,
                    f"Missing fields: {missing_fields}" if missing_fields else "All fields present"
                )
                
                self.test(
                    "Products do not contain MongoDB _id",
                    no_mongo_id,
                    "No _id field found" if no_mongo_id else "_id field present (should be removed)"
                )
            else:
                self.test("GET /api/products returns exactly 4 seeded products", False, "No products returned")
        else:
            self.test("GET /api/products returns seeded data", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # GET /api/categories
        self.log("Testing GET /api/categories")
        resp = self.make_request('GET', '/categories')
        if resp is not None and resp.status_code == 200:
            categories = resp.json()
            slugs = [c.get('slug') for c in categories]
            expected_slugs = ['spell-jars', 'apparel', 'apothecary']
            has_expected = all(s in slugs for s in expected_slugs)
            no_mongo_id = all('_id' not in c for c in categories)
            
            self.test(
                "GET /api/categories returns expected slugs",
                has_expected,
                f"Found slugs: {slugs}"
            )
            
            self.test(
                "Categories do not contain MongoDB _id",
                no_mongo_id,
                "No _id fields found" if no_mongo_id else "_id fields present"
            )
        else:
            self.test("GET /api/categories", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # GET /api/hero
        self.log("Testing GET /api/hero")
        resp = self.make_request('GET', '/hero')
        if resp is not None and resp.status_code == 200:
            hero = resp.json()
            required_fields = ['headline', 'subheadline', 'promo_text', 'primary_cta',
                             'secondary_cta', 'background_image', 'glow_color', 'promo_badge']
            has_fields = all(f in hero for f in required_fields)
            no_mongo_id = '_id' not in hero
            
            # Store original headline for later restoration
            self.original_hero_headline = hero.get('headline')
            
            self.test(
                "GET /api/hero returns expected structure",
                has_fields and no_mongo_id,
                f"Has all fields: {has_fields}, No _id: {no_mongo_id}"
            )
        else:
            self.test("GET /api/hero", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # GET /api/branding
        self.log("Testing GET /api/branding")
        resp = self.make_request('GET', '/branding')
        if resp is not None and resp.status_code == 200:
            branding = resp.json()
            has_site_name = branding.get('site_name') == 'Hexpose!'
            has_theme = 'theme_colors' in branding
            has_social = 'social' in branding
            no_mongo_id = '_id' not in branding
            
            self.test(
                "GET /api/branding returns expected structure",
                has_site_name and has_theme and has_social and no_mongo_id,
                f"site_name: {branding.get('site_name')}, has theme_colors: {has_theme}, has social: {has_social}, no _id: {no_mongo_id}"
            )
        else:
            self.test("GET /api/branding", False,
                     f"Status: {resp.status_code if resp else 'No response'}")

    def test_2_product_filters(self):
        """Test 2: Product filters"""
        print("\n" + "=" * 80)
        print("TEST 2: PRODUCT FILTERS")
        print("=" * 80 + "\n")
        
        # Filter by category=spell-jars
        self.log("Testing GET /api/products?category=spell-jars")
        resp = self.make_request('GET', '/products?category=spell-jars')
        if resp is not None and resp.status_code == 200:
            products = resp.json()
            self.test(
                "Filter by category=spell-jars returns 3 items",
                len(products) == 3,
                f"Found {len(products)} products"
            )
        else:
            self.test("Filter by category=spell-jars", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Filter by category=apparel
        self.log("Testing GET /api/products?category=apparel")
        resp = self.make_request('GET', '/products?category=apparel')
        if resp is not None and resp.status_code == 200:
            products = resp.json()
            has_tshirt = any('T-Shirt' in p.get('name', '') for p in products)
            self.test(
                "Filter by category=apparel returns 1 item (T-Shirt)",
                len(products) == 1 and has_tshirt,
                f"Found {len(products)} products, has T-Shirt: {has_tshirt}"
            )
        else:
            self.test("Filter by category=apparel", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Filter by featured=1
        self.log("Testing GET /api/products?featured=1")
        resp = self.make_request('GET', '/products?featured=1')
        if resp is not None and resp.status_code == 200:
            products = resp.json()
            all_featured = all(p.get('featured') == True for p in products)
            self.test(
                "Filter by featured=1 returns only featured products",
                all_featured and len(products) > 0,
                f"Found {len(products)} featured products, all featured: {all_featured}"
            )
        else:
            self.test("Filter by featured=1", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Search by q=protection
        self.log("Testing GET /api/products?q=protection")
        resp = self.make_request('GET', '/products?q=protection')
        if resp is not None and resp.status_code == 200:
            products = resp.json()
            has_protection = any('Protection' in p.get('name', '') for p in products)
            self.test(
                "Search q=protection returns Protection Spell Jar",
                len(products) == 1 and has_protection,
                f"Found {len(products)} products, has Protection: {has_protection}"
            )
        else:
            self.test("Search q=protection", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Slug lookup: protection-spell-jar
        self.log("Testing GET /api/products/slug/protection-spell-jar")
        resp = self.make_request('GET', '/products/slug/protection-spell-jar')
        if resp is not None and resp.status_code == 200:
            product = resp.json()
            has_spell = product.get('spell') is not None
            correct_intention = False
            if has_spell:
                correct_intention = product['spell'].get('magical_intention') == 'Protection & Warding'
            
            self.test(
                "Slug lookup returns product with spell.magical_intention='Protection & Warding'",
                has_spell and correct_intention,
                f"Has spell: {has_spell}, Correct intention: {correct_intention}"
            )
        else:
            self.test("Slug lookup protection-spell-jar", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Nonexistent slug
        self.log("Testing GET /api/products/slug/nonexistent-slug")
        try:
            resp = self.make_request('GET', '/products/slug/nonexistent-slug')
            self.test(
                "Nonexistent slug returns 404",
                resp is not None and resp.status_code == 404,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("Nonexistent slug returns 404", False, f"Exception: {e}")

    def test_3_admin_auth(self):
        """Test 3: Admin authentication"""
        print("\n" + "=" * 80)
        print("TEST 3: ADMIN AUTH")
        print("=" * 80 + "\n")
        
        # Wrong password
        self.log("Testing POST /api/admin/login with wrong password")
        try:
            resp = self.make_request('POST', '/admin/login', 
                                    json={'password': 'wrong'})
            self.test(
                "Login with wrong password returns 401",
                resp is not None and resp.status_code == 401,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("Login with wrong password returns 401", False, f"Exception: {e}")
        
        # Correct password
        self.log("Testing POST /api/admin/login with correct password")
        resp = self.make_request('POST', '/admin/login',
                                json={'password': ADMIN_PASSWORD})
        if resp is not None and resp.status_code == 200:
            data = resp.json()
            has_cookie = 'set-cookie' in resp.headers or 'Set-Cookie' in resp.headers
            cookie_header = resp.headers.get('set-cookie') or resp.headers.get('Set-Cookie', '')
            has_hexpose_admin = 'hexpose_admin' in cookie_header
            
            # Store cookie for future requests
            if has_hexpose_admin:
                # Extract cookie value
                cookie_parts = cookie_header.split(';')
                for part in cookie_parts:
                    if 'hexpose_admin' in part:
                        self.admin_cookie = part.strip()
                        break
            
            self.test(
                "Login with correct password returns 200 with cookie",
                data.get('ok') == True and has_hexpose_admin,
                f"ok: {data.get('ok')}, has cookie: {has_hexpose_admin}"
            )
        else:
            self.test("Login with correct password", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Verify without cookie
        self.log("Testing GET /api/admin/verify without cookie")
        try:
            resp = requests.get(f"{BASE_URL}/admin/verify", timeout=30)
            if resp is not None and resp.status_code == 200:
                data = resp.json()
                self.test(
                    "Verify without cookie returns {authed:false}",
                    data.get('authed') == False,
                    f"authed: {data.get('authed')}, full response: {data}"
                )
            else:
                self.test("Verify without cookie", False,
                         f"Status: {resp.status_code if resp else 'No response'}")
        except Exception as e:
            self.test("Verify without cookie", False, f"Exception: {e}")
        
        # Verify with cookie
        self.log("Testing GET /api/admin/verify with cookie")
        resp = self.make_request('GET', '/admin/verify', use_admin=True)
        if resp is not None and resp.status_code == 200:
            data = resp.json()
            self.test(
                "Verify with cookie returns {authed:true}",
                data.get('authed') == True,
                f"authed: {data.get('authed')}"
            )
        else:
            self.test("Verify with cookie", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Test admin-only gating
        self.log("Testing admin-only route gating (POST /api/products without cookie)")
        try:
            resp = requests.post(f"{BASE_URL}/products", 
                               json={'name': 'Test'}, timeout=30)
            self.test(
                "POST /api/products without cookie returns 401",
                resp is not None and resp.status_code == 401,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("POST /api/products without cookie returns 401", False, f"Exception: {e}")
        
        self.log("Testing PUT /api/products/test-id without cookie")
        try:
            resp = requests.put(f"{BASE_URL}/products/test-id",
                              json={'price': 10}, timeout=30)
            self.test(
                "PUT /api/products/[id] without cookie returns 401",
                resp is not None and resp.status_code == 401,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("PUT /api/products/[id] without cookie returns 401", False, f"Exception: {e}")
        
        self.log("Testing DELETE /api/products/test-id without cookie")
        try:
            resp = requests.delete(f"{BASE_URL}/products/test-id", timeout=30)
            self.test(
                "DELETE /api/products/[id] without cookie returns 401",
                resp is not None and resp.status_code == 401,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("DELETE /api/products/[id] without cookie returns 401", False, f"Exception: {e}")
        
        self.log("Testing PUT /api/hero without cookie")
        try:
            resp = requests.put(f"{BASE_URL}/hero",
                              json={'headline': 'Test'}, timeout=30)
            self.test(
                "PUT /api/hero without cookie returns 401",
                resp is not None and resp.status_code == 401,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("PUT /api/hero without cookie returns 401", False, f"Exception: {e}")
        
        self.log("Testing PUT /api/branding without cookie")
        try:
            resp = requests.put(f"{BASE_URL}/branding",
                              json={'tagline': 'Test'}, timeout=30)
            self.test(
                "PUT /api/branding without cookie returns 401",
                resp is not None and resp.status_code == 401,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("PUT /api/branding without cookie returns 401", False, f"Exception: {e}")

    def test_4_product_mutations(self):
        """Test 4: Product mutations (with admin cookie)"""
        print("\n" + "=" * 80)
        print("TEST 4: PRODUCT MUTATIONS (ADMIN)")
        print("=" * 80 + "\n")
        
        # Create product
        self.log("Testing POST /api/products (create)")
        resp = self.make_request('POST', '/products',
                                json={
                                    'name': 'Test Ritual Candle',
                                    'category': 'apothecary',
                                    'price': 19.99,
                                    'description': 'test',
                                    'featured': False
                                }, use_admin=True)
        
        if resp is not None and resp.status_code == 200:
            product = resp.json()
            has_id = 'id' in product and product['id']
            correct_slug = product.get('slug') == 'test-ritual-candle'
            correct_inventory = product.get('inventory') == 0
            correct_active = product.get('active') == True
            no_mongo_id = '_id' not in product
            
            if has_id:
                self.test_product_id = product['id']
            
            self.test(
                "POST /api/products creates product with correct fields",
                has_id and correct_slug and correct_inventory and correct_active and no_mongo_id,
                f"Has UUID id: {has_id}, slug: {product.get('slug')}, inventory: {product.get('inventory')}, active: {product.get('active')}, no _id: {no_mongo_id}"
            )
        else:
            self.test("POST /api/products", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Get created product
        if self.test_product_id:
            self.log(f"Testing GET /api/products/{self.test_product_id}")
            resp = self.make_request('GET', f'/products/{self.test_product_id}')
            if resp is not None and resp.status_code == 200:
                product = resp.json()
                self.test(
                    "GET /api/products/[new_id] returns created product",
                    product.get('id') == self.test_product_id,
                    f"Product id: {product.get('id')}"
                )
            else:
                self.test("GET /api/products/[new_id]", False,
                         f"Status: {resp.status_code if resp else 'No response'}")
            
            # Update product
            self.log(f"Testing PUT /api/products/{self.test_product_id}")
            resp = self.make_request('PUT', f'/products/{self.test_product_id}',
                                    json={
                                        'price': 24.99,
                                        'featured': True,
                                        'spell': {'magical_intention': 'Test'}
                                    }, use_admin=True)
            
            if resp is not None and resp.status_code == 200:
                product = resp.json()
                correct_price = product.get('price') == 24.99
                correct_featured = product.get('featured') == True
                has_spell = product.get('spell') is not None
                
                self.test(
                    "PUT /api/products/[id] updates fields correctly",
                    correct_price and correct_featured and has_spell,
                    f"price: {product.get('price')}, featured: {product.get('featured')}, has spell: {has_spell}"
                )
            else:
                self.test("PUT /api/products/[id]", False,
                         f"Status: {resp.status_code if resp else 'No response'}")
            
            # Test draft product (active:false) visibility
            self.log("Testing draft product visibility")
            # Create draft product
            resp = self.make_request('POST', '/products',
                                    json={
                                        'name': 'Draft Product',
                                        'category': 'apothecary',
                                        'price': 9.99,
                                        'active': False
                                    }, use_admin=True)
            
            draft_id = None
            if resp is not None and resp.status_code == 200:
                draft_id = resp.json().get('id')
            
            if draft_id:
                # Check it appears in admin view
                try:
                    resp_admin = self.make_request('GET', '/products?all=1', use_admin=True)
                    resp_public = requests.get(f"{BASE_URL}/products", timeout=30)
                    
                    admin_has_draft = False
                    public_has_draft = False
                    
                    if resp_admin and resp_admin.status_code == 200:
                        admin_products = resp_admin.json()
                        admin_has_draft = any(p.get('id') == draft_id for p in admin_products)
                    
                    if resp_public and resp_public.status_code == 200:
                        public_products = resp_public.json()
                        public_has_draft = any(p.get('id') == draft_id for p in public_products)
                    
                    self.test(
                        "Draft product (active:false) appears in admin view but not public",
                        admin_has_draft and not public_has_draft,
                        f"In admin view: {admin_has_draft}, In public view: {public_has_draft}"
                    )
                    
                    # Clean up draft
                    self.make_request('DELETE', f'/products/{draft_id}', use_admin=True)
                except Exception as e:
                    self.test("Draft product visibility", False, f"Exception: {e}")
            
            # Delete product
            self.log(f"Testing DELETE /api/products/{self.test_product_id}")
            resp = self.make_request('DELETE', f'/products/{self.test_product_id}',
                                    use_admin=True)
            
            if resp is not None and resp.status_code == 200:
                data = resp.json()
                self.test(
                    "DELETE /api/products/[id] returns {ok:true}",
                    data.get('ok') == True,
                    f"Response: {data}"
                )
                
                # Verify deletion
                try:
                    resp_get = self.make_request('GET', f'/products/{self.test_product_id}')
                    self.test(
                        "GET after DELETE returns 404",
                        resp_get is not None and resp_get.status_code == 404,
                        f"Status: {resp_get.status_code if resp_get else 'No response'}"
                    )
                except Exception as e:
                    self.test("GET after DELETE returns 404", False, f"Exception: {e}")
            else:
                self.test("DELETE /api/products/[id]", False,
                         f"Status: {resp.status_code if resp else 'No response'}")

    def test_5_categories_mutations(self):
        """Test 5: Categories mutations (admin)"""
        print("\n" + "=" * 80)
        print("TEST 5: CATEGORIES MUTATIONS (ADMIN)")
        print("=" * 80 + "\n")
        
        # Create category
        self.log("Testing POST /api/categories")
        resp = self.make_request('POST', '/categories',
                                json={'name': 'Ritual Tools'},
                                use_admin=True)
        
        if resp is not None and resp.status_code == 200:
            category = resp.json()
            has_id = 'id' in category and category['id']
            correct_slug = category.get('slug') == 'ritual-tools'
            no_mongo_id = '_id' not in category
            
            if has_id:
                self.test_category_id = category['id']
            
            self.test(
                "POST /api/categories creates category with auto slug",
                has_id and correct_slug and no_mongo_id,
                f"Has id: {has_id}, slug: {category.get('slug')}, no _id: {no_mongo_id}"
            )
        else:
            self.test("POST /api/categories", False,
                     f"Status: {resp.status_code if resp else 'No response'}")
        
        # Delete category
        if self.test_category_id:
            self.log(f"Testing DELETE /api/categories/{self.test_category_id}")
            resp = self.make_request('DELETE', f'/categories/{self.test_category_id}',
                                    use_admin=True)
            
            if resp is not None and resp.status_code == 200:
                data = resp.json()
                self.test(
                    "DELETE /api/categories/[id] returns {ok:true}",
                    data.get('ok') == True,
                    f"Response: {data}"
                )
            else:
                self.test("DELETE /api/categories/[id]", False,
                         f"Status: {resp.status_code if resp else 'No response'}")

    def test_6_hero_put(self):
        """Test 6: Hero PUT"""
        print("\n" + "=" * 80)
        print("TEST 6: HERO PUT")
        print("=" * 80 + "\n")
        
        # Update hero
        self.log("Testing PUT /api/hero")
        resp = self.make_request('PUT', '/hero',
                                json={
                                    'headline': 'NEW HEADLINE TEST',
                                    'glow_color': '#00ffff'
                                }, use_admin=True)
        
        if resp is not None and resp.status_code == 200:
            hero = resp.json()
            correct_headline = hero.get('headline') == 'NEW HEADLINE TEST'
            correct_glow = hero.get('glow_color') == '#00ffff'
            has_subheadline = 'subheadline' in hero
            
            self.test(
                "PUT /api/hero updates fields correctly",
                correct_headline and correct_glow and has_subheadline,
                f"headline: {hero.get('headline')}, glow_color: {hero.get('glow_color')}, has subheadline: {has_subheadline}"
            )
            
            # Verify with GET
            resp_get = self.make_request('GET', '/hero')
            if resp_get and resp_get.status_code == 200:
                hero_get = resp_get.json()
                self.test(
                    "GET /api/hero returns updated headline",
                    hero_get.get('headline') == 'NEW HEADLINE TEST',
                    f"headline: {hero_get.get('headline')}"
                )
            
            # Restore original headline
            if self.original_hero_headline:
                self.log("Restoring original hero headline")
                self.make_request('PUT', '/hero',
                                json={'headline': self.original_hero_headline},
                                use_admin=True)
        else:
            self.test("PUT /api/hero", False,
                     f"Status: {resp.status_code if resp else 'No response'}")

    def test_7_branding_put(self):
        """Test 7: Branding PUT"""
        print("\n" + "=" * 80)
        print("TEST 7: BRANDING PUT")
        print("=" * 80 + "\n")
        
        # Update branding
        self.log("Testing PUT /api/branding")
        resp = self.make_request('PUT', '/branding',
                                json={'tagline': 'Test tagline via API'},
                                use_admin=True)
        
        if resp is not None and resp.status_code == 200:
            branding = resp.json()
            correct_tagline = branding.get('tagline') == 'Test tagline via API'
            
            self.test(
                "PUT /api/branding updates tagline",
                correct_tagline,
                f"tagline: {branding.get('tagline')}"
            )
            
            # Verify with GET
            resp_get = self.make_request('GET', '/branding')
            if resp_get and resp_get.status_code == 200:
                branding_get = resp_get.json()
                self.test(
                    "GET /api/branding returns updated tagline",
                    branding_get.get('tagline') == 'Test tagline via API',
                    f"tagline: {branding_get.get('tagline')}"
                )
        else:
            self.test("PUT /api/branding", False,
                     f"Status: {resp.status_code if resp else 'No response'}")

    def test_8_newsletter_contact(self):
        """Test 8: Newsletter & Contact (public)"""
        print("\n" + "=" * 80)
        print("TEST 8: NEWSLETTER & CONTACT")
        print("=" * 80 + "\n")
        
        # Newsletter with email
        self.log("Testing POST /api/newsletter with email")
        try:
            resp = requests.post(f"{BASE_URL}/newsletter",
                               json={'email': 'witch@example.com'},
                               timeout=30)
            
            if resp is not None and resp.status_code == 200:
                data = resp.json()
                self.test(
                    "POST /api/newsletter with email returns {ok:true}",
                    data.get('ok') == True,
                    f"Response: {data}"
                )
            else:
                self.test("POST /api/newsletter with email", False,
                         f"Status: {resp.status_code if resp else 'No response'}")
        except Exception as e:
            self.test("POST /api/newsletter with email", False, f"Exception: {e}")
        
        # Newsletter without email
        self.log("Testing POST /api/newsletter without email")
        try:
            resp = requests.post(f"{BASE_URL}/newsletter",
                               json={},
                               timeout=30)
            
            self.test(
                "POST /api/newsletter without email returns 400",
                resp is not None and resp.status_code == 400,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("POST /api/newsletter without email returns 400", False, f"Exception: {e}")
        
        # Contact with all fields
        self.log("Testing POST /api/contact with email and message")
        try:
            resp = requests.post(f"{BASE_URL}/contact",
                               json={'email': 'a@b.com', 'message': 'hi'},
                               timeout=30)
            
            if resp is not None and resp.status_code == 200:
                data = resp.json()
                self.test(
                    "POST /api/contact with email and message returns {ok:true}",
                    data.get('ok') == True,
                    f"Response: {data}"
                )
            else:
                self.test("POST /api/contact with email and message", False,
                         f"Status: {resp.status_code if resp else 'No response'}")
        except Exception as e:
            self.test("POST /api/contact with email and message", False, f"Exception: {e}")
        
        # Contact without message
        self.log("Testing POST /api/contact without message")
        try:
            resp = requests.post(f"{BASE_URL}/contact",
                               json={'email': 'a@b.com'},
                               timeout=30)
            
            self.test(
                "POST /api/contact without message returns 400",
                resp is not None and resp.status_code == 400,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("POST /api/contact without message returns 400", False, f"Exception: {e}")

    def test_9_admin_overview(self):
        """Test 9: Admin overview"""
        print("\n" + "=" * 80)
        print("TEST 9: ADMIN OVERVIEW")
        print("=" * 80 + "\n")
        
        # Without cookie
        self.log("Testing GET /api/admin/overview without cookie")
        try:
            resp = requests.get(f"{BASE_URL}/admin/overview", timeout=30)
            
            self.test(
                "GET /api/admin/overview without cookie returns 401",
                resp is not None and resp.status_code == 401,
                f"Status: {resp.status_code if resp else 'No response'}"
            )
        except Exception as e:
            self.test("GET /api/admin/overview without cookie returns 401", False, f"Exception: {e}")
        
        # With cookie
        self.log("Testing GET /api/admin/overview with cookie")
        resp = self.make_request('GET', '/admin/overview', use_admin=True)
        
        if resp is not None and resp.status_code == 200:
            data = resp.json()
            required_fields = ['products', 'active_products', 'categories', 'newsletter', 'contact']
            has_all_fields = all(f in data for f in required_fields)
            all_numeric = all(isinstance(data.get(f), int) for f in required_fields)
            
            self.test(
                "GET /api/admin/overview returns numeric stats",
                has_all_fields and all_numeric,
                f"Fields: {list(data.keys())}, All numeric: {all_numeric}"
            )
        else:
            self.test("GET /api/admin/overview with cookie", False,
                     f"Status: {resp.status_code if resp else 'No response'}")

    def test_10_logout(self):
        """Test 10: Logout"""
        print("\n" + "=" * 80)
        print("TEST 10: LOGOUT")
        print("=" * 80 + "\n")
        
        # Logout
        self.log("Testing POST /api/admin/logout")
        resp = self.make_request('POST', '/admin/logout', use_admin=True)
        
        if resp is not None and resp.status_code == 200:
            data = resp.json()
            has_clear_cookie = 'set-cookie' in resp.headers or 'Set-Cookie' in resp.headers
            
            self.test(
                "POST /api/admin/logout returns 200",
                data.get('ok') == True,
                f"Response: {data}, Has clear cookie: {has_clear_cookie}"
            )
            
            # Verify after logout
            # Note: We need to make request without the old cookie
            try:
                resp_verify = requests.get(f"{BASE_URL}/admin/verify", timeout=30)
                if resp_verify and resp_verify.status_code == 200:
                    verify_data = resp_verify.json()
                    self.test(
                        "GET /api/admin/verify after logout returns {authed:false}",
                        verify_data.get('authed') == False,
                        f"authed: {verify_data.get('authed')}, full response: {verify_data}"
                    )
            except Exception as e:
                self.test("GET /api/admin/verify after logout", False, f"Exception: {e}")
        else:
            self.test("POST /api/admin/logout", False,
                     f"Status: {resp.status_code if resp else 'No response'}")


if __name__ == '__main__':
    runner = TestRunner()
    success = runner.run_all_tests()
    sys.exit(0 if success else 1)
