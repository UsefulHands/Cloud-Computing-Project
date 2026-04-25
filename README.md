Ortak Not:

.env meselesi

2 tane .env dosyamız var. Birisi local development birisi de compose için.
.env dosyalarını.gitignoreye ekledim o yüzden göremezsin.
Hem backendin altındaki hem de deployments/school_project altındaki .env.example nin yanına .env oluşturup içeriğini aynı .env.example gibi yaparsan ve bilgileri isteğine göre doldurursan çalışacak.(iki .env de aynı olmalı)
Ayrıca ide environmenti eklemenize gerek yok. bunu için spring-dotenv dependencysini ekledim.

frontend tarafı:

/frontend directorysinde terminali açıp
{npm install} komutu ile gerekli olan .gitignoreye eklenmiş dosyaları indirin.
{npm start} ile de runlayabilirsiniz

ilk clone yaptığınızda

backend kısmındaki pom.xml e sağ tıklayın en alttaki add as maven project e tıklayın ve projenin maven projesi olduğunu idenize söylemiş olun.

database:
docker desktop yoksa indirin kaydolun. proje runlamadan önce docker desktop hep açık olmalı.
backend tarafında yapılan her değişiklikten sonra [docker compose up] komutunu çalıştırmanız gerekecek


proje runlama:
backend:
./mvnw spring-boot:run
frontend:
npm start