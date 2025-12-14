# Translation Keys to Add

This document lists all the NEW translation keys that need to be added to both `uk/translation.json` and `en/translation.json` files.

## ProjectDetails Keys

```json
"projectDetails": {
  "loading": "Loading project...",  // UK: "Завантаження проєкту..."
  "failedToLoad": "Unable to load project details",  // UK: "Не вдалося завантажити деталі проєкту"
  "overallProgress": "Overall progress",  // UK: "Загальний прогрес"
  "area": "Area",  // UK: "Площа"
  "completedStages": "Completed stages",  // UK: "Завершені етапи"
  "daysRemaining": "Days remaining",  // UK: "Днів залишилось"
  "stages": "Stages",  // UK: "Етапи"
  "photos": "Photos",  // UK: "Фотографії"
  "scans3D": "3D Scans",  // UK: "3D Скани"
  "projectNotes": "Project Notes"  // UK: "Нотатки проєкту"
}
```

## ClientManagement Keys

```json
"clientManagement": {
  "userAddedSuccess": "User added successfully",  // UK: "Користувача успішно додано"
  "failedToRegister": "Failed to register the user: {{email}}. Please insert this account again.",  // UK: "Не вдалося зареєструвати користувача: {{email}}. Будь ласка, додайте цей обліковий запис знову."
  "errorPerformingOperation": "Error performing operation for the user: ",  // UK: "Помилка виконання операції для користувача: "
  "userUpdatedSuccess": "User updated successfully",  // UK: "Користувача успішно оновлено"
  "failedToUpdate": "Failed to update the user: {{email}}. Please try again.",  // UK: "Не вдалося оновити користувача: {{email}}. Будь ласка, спробуйте ще раз."
  "userDeletedSuccess": "User deleted successfully",  // UK: "Користувача успішно видалено"
  "errorDeletingUser": "Error deleting user",  // UK: "Помилка видалення користувача"
  "unexpectedError": "An unexpected error occurred, please try again later",  // UK: "Сталася неочікувана помилка, спробуйте пізніше"
  "searchPlaceholder": "Search by name or email...",  // UK: "Пошук за іменем або email..."
  "noUsersFound": "No users found for this search",  // UK: "Користувачів не знайдено"
  "noUsersYet": "No users available yet. Add your first client!",  // UK: "Користувачів ще немає. Додайте свого першого клієнта!"
  "project": "project",  // UK: "проєкт"
  "projects": "projects",  // UK: "проєктів"
  "registered": "Registered",  // UK: "Зареєстровано"
  "overview": "Overview",  // UK: "Огляд"
  "confirmDeletion": "Confirm deletion",  // UK: "Підтвердіть видалення"
  "confirmDeleteMessage": "Are you sure you want to delete the user {{email}}?"  // UK: "Ви впевнені, що хочете видалити користувача {{email}}?"
}
```

## AdminDocuments Keys

```json
"adminDocuments": {
  "awaitingSignature": "Awaiting signature",  // UK: "Очікує підпису"
  "onlyPdfAllowed": "Only PDF files are allowed",  // UK: "Дозволені лише PDF файли"
  "pleaseSelectProject": "Please select a project",  // UK: "Будь ласка, виберіть проєкт"
  "documentUploadedSuccess": "Document uploaded successfully!",  // UK: "Документ успішно завантажено!"
  "uploadError": "Upload error",  // UK: "Помилка завантаження"
  "documentMarkedForSignature": "Document marked as requiring signature",  // UK: "Документ позначено як такий, що потребує підпису"
  "confirmDeleteDocument": "Delete document \"{{name}}\"?",  // UK: "Видалити документ \"{{name}}\"?"
  "documentSignedSuccess": "Document signed successfully!",  // UK: "Документ успішно підписано!"
  "failedToSignDocument": "Failed to sign document",  // UK: "Не вдалося підписати документ"
  "unknownProject": "Unknown Project",  // UK: "Невідомий проєкт"
  "signedOn": "Signed on",  // UK: "Підписано"
  "viewOriginal": "View original document",  // UK: "Переглянути оригінальний документ"
  "sendForSignature": "Send to client for signature",  // UK: "Відправити клієнту для підпису"
  "viewSignedDocument": "View signed document",  // UK: "Переглянути підписаний документ"
  "projectDocumentation": "Project documentation and agreements",  // UK: "Проєктна документація та угоди"
  "filterByProject": "Filter by Project",  // UK: "Фільтрувати за проєктом"
  "selectProject": "Select a project...",  // UK: "Виберіть проєкт..."
  "allProjects": "All Projects",  // UK: "Всі проєкти"
  "clearFilter": "Clear filter",  // UK: "Очистити фільтр"
  "showingDocuments": "Showing {{count}} of {{total}} documents",  // UK: "Показано {{count}} з {{total}} документів"
  "companyDocuments": "Company documents",  // UK: "Документи компанії"
  "noDocumentsYet": "No documents uploaded yet",  // UK: "Документів ще не завантажено"
  "noCompanyDocsForProject": "No company documents for this project",  // UK: "Немає документів компанії для цього проєкту"
  "clientDocuments": "Client documents",  // UK: "Документи клієнта"
  "clientNotUploadedYet": "Client has not uploaded any documents yet",  // UK: "Клієнт ще не завантажив жодного документа"
  "noClientDocsForProject": "No client documents for this project",  // UK: "Немає документів клієнта для цього проєкту"
  "file": "File",  // UK: "Файл"
  "selectProjectRequired": "Select Project *",  // UK: "Виберіть проєкт *"
  "chooseProject": "Choose a project...",  // UK: "Виберіть проєкт..."
  "makeVisibleToClient": "Make visible to client",  // UK: "Зробити видимим для клієнта"
  "requiresClientSignature": "Requires signature from client",  // UK: "Потребує підпису від клієнта"
  "documentInternal": "This document will be internal (visible only to admins).",  // UK: "Цей документ буде внутрішнім (видимий тільки адміністраторам)."
  "clientWillSignDocument": "The client will see this document and will be required to sign it.",  // UK: "Клієнт побачить цей документ і повинен буде його підписати."
  "clientWillViewDocument": "The client will see this document for information only (no signature required).",  // UK: "Клієнт побачить цей документ тільки для ознайомлення (підпис не потрібен)."
  "uploading": "Uploading..."  // UK: "Завантаження..."
}
```

## MessagesPage Keys

```json
"messagesPage": {
  "projectManager": "Project Manager",  // UK: "Менеджер проєкту"
  "client": "Client",  // UK: "Клієнт"
  "communicateWithClients": "Communicate with your clients",  // UK: "Спілкуйтеся з вашими клієнтами"
  "chatWithManager": "Chat with your project manager",  // UK: "Чат з вашим менеджером проєкту"
  "selectProject": "Select a project to start messaging",  // UK: "Виберіть проєкт, щоб почати листування"
  "loadingChat": "Loading chat..."  // UK: "Завантаження чату..."
}
```

## ClientDashboard Keys

```json
"clientDashboard": {
  "loadingDashboard": "Loading dashboard...",  // UK: "Завантаження панелі..."
  "couldNotLoad": "Could not load your dashboard. Please try again.",  // UK: "Не вдалося завантажити вашу панель. Спробуйте ще раз."
  "welcomeClient": "Welcome, {{name}}!",  // UK: "Ласкаво просимо, {{name}}!"
  "projectPercentComplete": "Your project is {{percent}}% complete.",  // UK: "Ваш проєкт завершено на {{percent}}%."
  "daysRemainingUntil": "{{days}} days remaining until the finish date.",  // UK: "{{days}} днів до дати завершення."
  "noImageAvailable": "No image available",  // UK: "Зображення недоступне"
  "startDate": "Start date",  // UK: "Дата початку"
  "plannedCompletion": "Planned completion",  // UK: "Планове завершення"
  "overallProgress": "Overall progress",  // UK: "Загальний прогрес"
  "constructionStages": "Construction stages",  // UK: "Етапи будівництва"
  "completed": "Completed",  // UK: "Завершено"
  "inProgress": "In Progress",  // UK: "В роботі"
  "pending": "Pending",  // UK: "Очікує"
  "noDescriptionProvided": "No description provided.",  // UK: "Опис не надано."
  "progress": "Progress",  // UK: "Прогрес"
  "latestUpdates": "Latest updates",  // UK: "Останні оновлення"
  "noUpdatesYet": "No updates yet.",  // UK: "Оновлень поки немає."
  "justNow": "Just now"  // UK: "Щойно"
}
```

## PhotoGallery Keys

```json
"photoGallery": {
  "title": "Photo gallery",  // UK: "Галерея фотографій"
  "photosCount": "{{count}} photos",  // UK: "{{count}} фотографій"
  "allStages": "All stages",  // UK: "Всі етапи"
  "photosCounter": "{{current}} / {{total}}"  // UK: "{{current}} / {{total}}"
}
```

## Viewer3D Keys

```json
"viewer3D": {
  "title": "3D Room Scans",  // UK: "3D Скани приміщень"
  "loadingScans": "Loading scans...",  // UK: "Завантаження сканів..."
  "noScanSelected": "No scan selected",  // UK: "Скан не вибрано"
  "room": "Room",  // UK: "Приміщення"
  "area": "Area",  // UK: "Площа"
  "scanDate": "Scan date",  // UK: "Дата сканування"
  "project": "Project",  // UK: "Проєкт"
  "downloadModel": "Download 3D model",  // UK: "Завантажити 3D модель"
  "totalScans": "Total scans",  // UK: "Всього сканів"
  "projects": "Projects",  // UK: "Проєкти"
  "untitledProject": "Untitled Project"  // UK: "Проєкт без назви"
}
```

## ClientDocuments Keys

```json
"clientDocuments": {
  "title": "Documents",  // UK: "Документи"
  "subtitle": "Here you can see documents from the company and your own uploads.",  // UK: "Тут ви можете побачити документи від компанії та ваші власні завантаження."
  "uploadDocument": "Upload document",  // UK: "Завантажити документ"
  "filterByProject": "Filter by Project:",  // UK: "Фільтрувати за проєктом:"
  "selectProject": "Select a project...",  // UK: "Виберіть проєкт..."
  "allProjects": "All Projects",  // UK: "Всі проєкти"
  "clearFilter": "Clear filter",  // UK: "Очистити фільтр"
  "fromCompany": "From the company",  // UK: "Від компанії"
  "myDocuments": "My documents",  // UK: "Мої документи"
  "noCompanyDocuments": "No documents from the company yet.",  // UK: "Документів від компанії ще немає."
  "noOwnDocuments": "You have not uploaded any documents yet.",  // UK: "Ви ще не завантажили жодного документа."
  "uploadTitle": "Upload Document",  // UK: "Завантажити документ"
  "file": "File",  // UK: "Файл"
  "selectProjectRequired": "Select Project *",  // UK: "Виберіть проєкт *"
  "chooseProject": "Choose a project...",  // UK: "Виберіть проєкт..."
  "titleOptional": "Title (optional)",  // UK: "Назва (необов'язково)"
  "titlePlaceholder": "Enter document title or leave blank to use filename",  // UK: "Введіть назву документа або залиште порожнім, щоб використати ім'я файлу"
  "requiresSignature": "This document requires a signature from the company",  // UK: "Цей документ потребує підпису від компанії"
  "signatureNote": "The company will be notified to sign this document.",  // UK: "Компанія буде повідомлена про необхідність підписати цей документ."
  "noSignatureNote": "This document will be sent to the company without requiring a signature.",  // UK: "Цей документ буде відправлено компанії без необхідності підпису."
  "uploading": "Uploading...",  // UK: "Завантаження..."
  "upload": "Upload",  // UK: "Завантажити"
  "onlyPdfAllowed": "Only PDF files are allowed",  // UK: "Дозволені лише PDF файли"
  "pleaseSelectProject": "Please select a project",  // UK: "Будь ласка, виберіть проєкт"
  "documentUploadedSuccess": "Document uploaded successfully!",  // UK: "Документ успішно завантажено!"
  "uploadError": "Upload error",  // UK: "Помилка завантаження"
  "failedToLoad": "Failed to load documents",  // UK: "Не вдалося завантажити документи"
  "failedToLoadProjects": "Failed to load projects",  // UK: "Не вдалося завантажити проєкти"
  "documentSigned": "Document signed successfully!",  // UK: "Документ успішно підписано!"
  "failedToSign": "Failed to sign document",  // UK: "Не вдалося підписати документ"
  "viewDocument": "View document",  // UK: "Переглянути документ"
  "viewSignedDocument": "View signed document",  // UK: "Переглянути підписаний документ"
  "signDocument": "Sign document",  // UK: "Підписати документ"
  "signedOn": "Signed on"  // UK: "Підписано"
}
```

## Calculator Keys

```json
"calculator": {
  "title": "Cost calculator",  // UK: "Калькулятор вартості"
  "subtitle": "Estimate the approximate construction cost",  // UK: "Оцініть приблизну вартість будівництва"
  "houseArea": "House area (m²)",  // UK: "Площа будинку (м²)"
  "areaPlaceholder": "For example, 180",  // UK: "Наприклад, 180"
  "foundationType": "Foundation type",  // UK: "Тип фундаменту"
  "monolithic": "Monolithic (recommended)",  // UK: "Монолітний (рекомендовано)"
  "pileFoundation": "Pile foundation",  // UK: "Пальовий фундамент"
  "stripFoundation": "Strip foundation",  // UK: "Стрічковий фундамент"
  "wallMaterial": "Wall material",  // UK: "Матеріал стін"
  "aeratedConcrete": "Aerated concrete (economy)",  // UK: "Газобетон (економ)"
  "brick": "Brick (premium)",  // UK: "Цегла (преміум)"
  "frame": "Framed (fast build)",  // UK: "Каркасний (швидке будівництво)"
  "roofType": "Roof type",  // UK: "Тип даху"
  "tile": "Tile",  // UK: "Черепиця"
  "metalTile": "Metal tile",  // UK: "Металочерепиця"
  "flatRoof": "Flat roof",  // UK: "Плоский дах"
  "finishingLevel": "Finishing level",  // UK: "Рівень оздоблення"
  "basic": "Basic",  // UK: "Базовий"
  "standard": "Standard",  // UK: "Стандартний"
  "premium": "Premium",  // UK: "Преміум"
  "numberOfFloors": "Number of floors",  // UK: "Кількість поверхів"
  "oneFloor": "1 floor",  // UK: "1 поверх"
  "twoFloors": "2 floors",  // UK: "2 поверхи"
  "threeFloors": "3 floors",  // UK: "3 поверхи"
  "calculateCost": "Calculate cost",  // UK: "Розрахувати вартість"
  "result": "Result",  // UK: "Результат"
  "estimatedCost": "Estimated cost",  // UK: "Оціночна вартість"
  "costPerSqm": "Cost per m²",  // UK: "Вартість за м²"
  "includes": "Includes:",  // UK: "Включає:"
  "allMaterials": "All construction materials",  // UK: "Всі будівельні матеріали"
  "crewLabor": "Crew labor",  // UK: "Робоча сила"
  "deliveryToSite": "Delivery to the site",  // UK: "Доставка на об'єкт"
  "qualityControl": "Quality control",  // UK: "Контроль якості"
  "requestConsultation": "Request a consultation",  // UK: "Запит на консультацію"
  "fillFormPrompt": "Fill out the form to calculate the construction cost"  // UK: "Заповніть форму, щоб розрахувати вартість будівництва"
}
```

## Instructions

1. Add all these keys to `client/src/locales/uk/translation.json` with the Ukrainian translations (shown in comments as // UK: ...)
2. Add all these keys to `client/src/locales/en/translation.json` with the English translations (the main values shown)
3. Make sure to maintain the existing JSON structure and add these as new sections or merge with existing sections as appropriate
