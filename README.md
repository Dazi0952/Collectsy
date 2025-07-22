🧰 Collectsy
Collectsy to minimalistyczna aplikacja do zarządzania kolekcjami (np. książki, płyty, filmy). Umożliwia dodawanie, edycję oraz przeglądanie przedmiotów w kolekcji za pomocą przyjaznego interfejsu.

🚀 Funkcjonalności
Dodawanie nowych elementów (tytuł, opis, data wydania, tagi itd.)

Edycja i usuwanie już istniejących pozycji

Przeglądanie kolekcji – lista/all/filtr/tag

Sortowanie według daty dodania lub tytułu

Responsywny interfejs działający na desktopie i urządzeniach mobilnych

🔧 Wymagania
Node.js (wersja 16+) oraz npm lub yarn

Preferowana przeglądarka – Google Chrome / Firefox / Edge (aktualne wersje)

⚙️ Instalacja
Sklonuj repo:

bash
Kopiuj
Edytuj
git clone https://github.com/Dazi0952/Collectsy.git
cd Collectsy
Zainstaluj zależności:

bash
Kopiuj
Edytuj
npm install
# lub
yarn install
Uruchom aplikację w trybie deweloperskim:

bash
Kopiuj
Edytuj
npm start
# lub
yarn start
Otwórz przeglądarkę i wejdź na http://localhost:3000

🧪 Testy
Jeśli projekt zawiera testy (np. przy użyciu Jest lub React Testing Library), możesz je uruchomić poleceniem:

bash
Kopiuj
Edytuj
npm test
# lub
yarn test
🛠️ Struktura projektu
csharp
Kopiuj
Edytuj
Collectsy/
├── public/           # Pliki statyczne (HTML, ikony)
├── src/              # Główne źródła (komponenty, style, logika)
│   ├── components/   # Reużywalne komponenty UI
│   ├── pages/        # Główne widoki/kolekcje
│   ├── hooks/        # Własne hooki Reacta
│   ├── utils/        # Pomocnicze funkcje
│   └── App.js        # Główny komponent aplikacji
├── package.json      # Informacje o projekcie i zależnościach
└── README.md         # Ten plik
🌱 Użyte technologie
React – biblioteka do budowy interfejsu użytkownika

(opcjonalnie) Redux / Context API – zarządzanie stanem

(opcjonalnie) React Router – nawigacja po stronach

(opcjonalnie) Styled Components / SASS – styling aplikacji

🤝 Wkład w projekt
Chcesz coś zmienić lub dodać nową funkcję? Świetnie!

Zrób fork repozytorium

Utwórz branch tematyczny: feature/nazwa-funkcjonalności

Dokonaj zmian i dodaj testy (jeśli dotyczy)

Wyślij pull request z opisem zmian

📜 Licencja
Projekt dostępny na licencji MIT. Szczegóły w pliku LICENSE.
