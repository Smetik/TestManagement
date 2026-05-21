# TestManagement

TestManagement — приложение для создания, редактирования и прохождения тестов. Проект состоит из ASP.NET Core Web API и desktop/web-клиента на Tauri + React.

## Стек технологий

### Backend

- ASP.NET Core 8
- Entity Framework Core
- SQLite
- Swagger
- DTO для обмена данными
- `async/await`
- Repository pattern
- Архитектура `Controllers -> Services -> Repositories`

### Frontend

- Tauri + React
- TypeScript
- CSS без UI-библиотек
- Backend API: `http://localhost:5227/api/tests`
- Frontend dev server: `http://localhost:1420`

## Возможности приложения

- создание тестов
- редактирование тестов
- удаление тестов
- удаление всех тестов
- создание готовых тестов
- просмотр списка тестов
- просмотр деталей теста
- прохождение теста
- автоматический подсчёт результата
- отображение результата в формате `score / maxScore` и `percentage%`

## Типы вопросов

- `SingleChoice` — одиночный выбор
- `MultipleChoice` — множественный выбор

## Логика подсчёта результата

### SingleChoice

- 1 балл, если выбран ровно один правильный ответ
- 0 баллов во всех остальных случаях

### MultipleChoice

- вопрос максимум даёт 1 балл
- `weight = 1 / количество правильных ответов`
- `score = correctlySelected * weight - incorrectlySelected * weight`
- итоговый балл за вопрос не может быть меньше 0

Пример: если в вопросе `MultipleChoice` два правильных ответа, а пользователь выбрал только один правильный вариант, вопрос даёт `0.5` балла.

## Структура проекта

```text
TestManagement
├── TestManagement.Api
└── TestManagement.Client
```

## API endpoints

```text
GET    /api/tests
POST   /api/tests
GET    /api/tests/{id}
PUT    /api/tests/{id}
DELETE /api/tests/{id}
POST   /api/tests/{id}/submit
```

## Требования для запуска

- .NET SDK 8
- Node.js
- npm
- EF Core CLI tools

Если EF Core tools не установлены:

```bash
dotnet tool install --global dotnet-ef --version 8.0.0
```

## Запуск backend

```bash
cd TestManagement.Api
dotnet restore
dotnet ef database update
dotnet run
```

Backend запускается на:

```text
http://localhost:5227
```

Swagger:

```text
http://localhost:5227/swagger
```

## Запуск frontend

В отдельном терминале:

```bash
cd TestManagement.Client
npm install
npm run dev
```

Frontend запускается на:

```text
http://localhost:1420
```

## Ручная проверка

1. Запустить backend.
2. Запустить frontend.
3. Открыть frontend в браузере.
4. Нажать `Создать готовые тесты`.
5. Открыть тест из списка.
6. Выбрать ответы.
7. Нажать `Завершить тест`.
8. Проверить результат в формате `score / maxScore` и `percentage%`.

## Проверка дробного балла

Пример сценария:

1. Открыть тест с вопросом `MultipleChoice`.
2. В вопросе с двумя правильными ответами выбрать только один правильный вариант.
3. Завершить тест.
4. Результат должен быть частичным. Например, если первый вопрос `SingleChoice` отвечен правильно, а во втором вопросе `MultipleChoice` выбран один правильный ответ из двух, итог будет:

```text
Результат: 1.5 / 2
Процент: 75%
```

## Git workflow

Разработка велась в feature-ветках:

- `feature/domain-models`
- `feature/database-layer`
- `feature/test-crud-api`
- `feature/test-passing`
- `feature/frontend-client`
- `feature/documentation`

Изменения сливались в `main` через Pull Request.

## Примечания

- SQLite база создаётся локально.
- Backend должен быть запущен перед frontend.
- Если frontend не видит данные, нужно проверить, запущен ли backend на `http://localhost:5227`.
