<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Hair Growth & Density Treatment',
                'description' => 'Tratamiento anticaída para el pelo. Tratamiento intensivo que ayuda a frenar la caída capilar y estimular el crecimiento del cabello gracias a sus Freshly Vegan Capsules y 9 activos clínicos altamente efectivos.',
                'price' => 29.95,
                'stock' => 50,
                'category' => 'Tratamientos',
                'brand' => 'Freshly Cosmetics',
                'image_url' => 'https://www.druni.es/media/catalog/product/5/0/5033248.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/hair-growth-density-treatment-freshly-cosmetics-tratamiento-anticaida',
            ],
            [
                'name' => 'Curl Wave Eco Styler Gel Fijación',
                'description' => 'Gel de fijación para rizos y ondas. Proporciona una fijación duradera sin residuos, ideal para definir y mantener rizos naturales con un acabado flexible.',
                'price' => 2.75,
                'stock' => 30,
                'category' => 'Productos de Peinado',
                'brand' => 'Eco Styler',
                'image_url' => 'https://www.druni.es/media/catalog/product/7/2/7254.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/curl-wave-eco-styler-gel-fijacion',
            ],
            [
                'name' => 'Rizos Definidos Pantene Espuma Fijación Nutritiva',
                'description' => 'Espuma nutritiva que define los rizos proporcionando fijación y nutrición al cabello. Mantiene los rizos hidratados y sin encrespamiento durante todo el día.',
                'price' => 5.99,
                'stock' => 40,
                'category' => 'Productos de Peinado',
                'brand' => 'Pantene',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/3/1308440.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/rizos-definidos-pantene-espuma-fijacion-nutritiva',
            ],
            [
                'name' => 'Got2b Powder Full Polvo Peinado Voluminizador',
                'description' => 'Polvo voluminizador que añade volumen y textura al cabello instantáneamente. Ideal para crear peinados con más cuerpo y fijación duradera.',
                'price' => 4.99,
                'stock' => 35,
                'category' => 'Productos de Peinado',
                'brand' => 'Got2b',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/3/1307098.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/got2b-powder-full-polvo-peinado-voluminizador',
            ],
            [
                'name' => 'Men Advanced Llongueras Cera Peinado Mate',
                'description' => 'Cera de peinado mate para hombres que ofrece una fijación fuerte con acabado natural. Permite moldear el cabello sin dejar residuos grasos, ideal para estilos masculinos.',
                'price' => 4.99,
                'stock' => 25,
                'category' => 'Productos de Peinado',
                'brand' => 'Llongueras',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/3/1304138.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/men-advanced-llongueras-cera-peinado-mate-conseguir-cabello-natural',
            ],
            [
                'name' => 'KERZO Choc - Loción intensiva para cabellos en fase de caída importante',
                'description' => 'Contra la caída continuada e intensa. Aplicación rápida y directa sobre el cuero cabelludo. AYUDA a combatir la caída, TONIFICA el cuero cabelludo. Fórmula exclusiva con Trichodyn®, activo anti-caída patentado, y proteínas naturales de seda que reestructuran el cabello devolviéndole todo su vigor y flexibilidad.',
                'price' => 6.99,
                'stock' => 40,
                'category' => 'Tratamientos',
                'brand' => 'KERZO',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/3/1309022.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/choc-kerzo-locion-intensiva-cabellos-fase-caida-importante',
            ],
            [
                'name' => 'KERZO Anti-Caída Fortificante - Champú para cabellos normales en situación de caída',
                'description' => 'Champú de uso frecuente para cabellos normales en situación de caída. KERZO champú anticaída Fortificante con Trichodyn y extracto natural de Tomillo. Fórmula exclusiva con activo anti-caída patentado que ralentiza la caída del cabello y fortalece el folículo piloso.',
                'price' => 3.99,
                'stock' => 50,
                'category' => 'Champús',
                'brand' => 'KERZO',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/3/1306652.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/anti-caida-fortificante-kerzo-champu-cabellos-normales-situacion-caida',
            ],
            [
                'name' => 'K-Genesis Fondant Renforcateur Kérastase - Acondicionador fortalecedor anti-caída',
                'description' => 'Acondicionador fortalecedor anti-caída de Kérastase. Tratamiento intensivo que fortalece el cabello desde la raíz, previene la caída y estimula el crecimiento. Proporciona nutrición profunda y mejora la resistencia del cabello.',
                'price' => 24.99,
                'stock' => 30,
                'category' => 'Acondicionadores',
                'brand' => 'Kérastase',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/0/10146.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/k-genesis-fondant-renforcateur-kerastase-acondicionador-fortalecedor-anti-caida',
            ],
            [
                'name' => 'Olive Oil Eco Styler - Gel fijador capilar',
                'description' => 'Gel fijador capilar con aceite de oliva. Proporciona una fijación duradera y flexible para todo tipo de cabellos. Enriquecido con aceite de oliva que nutre y protege el cabello mientras mantiene el peinado.',
                'price' => 2.75,
                'stock' => 45,
                'category' => 'Productos de Peinado',
                'brand' => 'Eco Styler',
                'image_url' => 'https://www.druni.es/media/catalog/product/8/2/8220.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/olive-oil-eco-styler-gel-fijador-capilar',
            ],
            [
                'name' => 'Re-Fortalece TRESemmé - Protector de calor',
                'description' => 'Protector de calor que fortalece y protege el cabello del daño causado por herramientas de calor. Reduce la rotura del cabello hasta un 80% y proporciona protección hasta 230°C. Ideal para uso diario con planchas y secadores.',
                'price' => 5.99,
                'stock' => 40,
                'category' => 'Tratamientos',
                'brand' => 'TRESemmé',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/3/1305027.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/re-fortalece-tresemme-protector-calor',
            ],
            [
                'name' => 'Coconut Oil Eco Styler - Gel de fijación',
                'description' => 'Gel fijador efecto gomina sin acartonamiento con Aceite de Coco ECO STYLER para todo tipo de cabello. Brilla, alisa y acondiciona el cabello. Sin escamas, sin pegajosidad, anti-picazón. Con protección UV. Su ingrediente estrella: aceite de coco 100% puro que aporta brillo, hidratación y ayuda a retener la humedad en el cabello y cuero cabelludo. Fijación muy fuerte, ligero y tacto suave.',
                'price' => 2.75,
                'stock' => 50,
                'category' => 'Productos de Peinado',
                'brand' => 'Eco Styler',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/3/1308112.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/coconut-oil-eco-styler-gel-fijacion',
            ],
            [
                'name' => 'Genesis Homme Serum Anti-Chute Fortifiant Kérastase - Serum fortificante anti-caída',
                'description' => 'Serum fortificante anti-caída de Kérastase para hombres. Tratamiento intensivo que fortalece el cabello desde la raíz, previene la caída y estimula el crecimiento capilar. Proporciona nutrición profunda y mejora la resistencia del cabello. Fórmula avanzada diseñada específicamente para las necesidades del cabello masculino.',
                'price' => 29.99,
                'stock' => 25,
                'category' => 'Tratamientos',
                'brand' => 'Kérastase',
                'image_url' => 'https://www.druni.es/media/catalog/product/7/0/7003423.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/genesis-homme-serum-anti-chute-fortifiant-kerastase-serum-fortificante-anticaida',
            ],
            [
                'name' => 'Caffeine Energizante Alpecin - Champú prevención caída',
                'description' => 'Champú energizante con cafeína de Alpecin para la prevención de la caída del cabello. La cafeína activa las raíces del cabello y estimula el crecimiento. Fórmula especial que penetra profundamente en el cuero cabelludo, fortaleciendo el folículo piloso y reduciendo la caída del cabello. Ideal para uso diario.',
                'price' => 4.99,
                'stock' => 45,
                'category' => 'Champús',
                'brand' => 'Alpecin',
                'image_url' => 'https://www.druni.es/media/catalog/product/1/3/1308914.jpg?quality=80&fit=bounds&height=700&width=700&canvas=700:700',
                'purchase_url' => 'https://www.druni.es/caffeine-energizante-alpecin-champu-prevencion-caida',
            ],
        ];

        foreach ($products as $data) {
            Product::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                array_merge(
                    $data,
                    [
                        'slug' => Str::slug($data['name']),
                        'is_active' => true,
                        'gallery' => [],
                    ]
                )
            );
        }
    }
}

