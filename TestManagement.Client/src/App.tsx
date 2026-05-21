import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5227/api/tests";

type QuestionType = 0 | 1;

type TestListDto = {
  id: string;
  title: string;
  description?: string;
  questionsCount: number;
};

type AnswerOptionDto = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuestionDto = {
  id: string;
  text: string;
  type: QuestionType;
  answerOptions: AnswerOptionDto[];
};

type TestDetailsDto = {
  id: string;
  title: string;
  description?: string;
  questions: QuestionDto[];
};

type CreateTestDto = {
  title: string;
  description: string;
  questions: {
    text: string;
    type: QuestionType;
    answerOptions: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
};

type SubmitTestDto = {
  answers: {
    questionId: string;
    selectedAnswerOptionIds: string[];
  }[];
};

type TestResultDto = {
  score: number;
  maxScore: number;
  percentage: number;
};

type AnswerForm = {
  localId: string;
  text: string;
  isCorrect: boolean;
};

type QuestionForm = {
  localId: string;
  text: string;
  type: QuestionType;
  answerOptions: AnswerForm[];
};

type TestForm = {
  title: string;
  description: string;
  questions: QuestionForm[];
};

function createLocalId() {
  return crypto.randomUUID();
}

function createEmptyAnswer(): AnswerForm {
  return {
    localId: createLocalId(),
    text: "",
    isCorrect: false,
  };
}

function createEmptyQuestion(): QuestionForm {
  return {
    localId: createLocalId(),
    text: "",
    type: 0,
    answerOptions: [createEmptyAnswer(), createEmptyAnswer()],
  };
}

function createEmptyForm(): TestForm {
  return {
    title: "",
    description: "",
    questions: [createEmptyQuestion()],
  };
}

function createExampleForm(): TestForm {
  return {
    title: "Основы программирования",
    description: "Тест по базовым понятиям программирования",
    questions: [
      {
        localId: createLocalId(),
        text: "Что такое класс?",
        type: 0,
        answerOptions: [
          {
            localId: createLocalId(),
            text: "Шаблон для создания объектов",
            isCorrect: true,
          },
          {
            localId: createLocalId(),
            text: "Таблица в базе данных",
            isCorrect: false,
          },
          {
            localId: createLocalId(),
            text: "Обычная переменная",
            isCorrect: false,
          },
        ],
      },
      {
        localId: createLocalId(),
        text: "Какие из перечисленных типов являются коллекциями?",
        type: 1,
        answerOptions: [
          {
            localId: createLocalId(),
            text: "List",
            isCorrect: true,
          },
          {
            localId: createLocalId(),
            text: "Dictionary",
            isCorrect: true,
          },
          {
            localId: createLocalId(),
            text: "int",
            isCorrect: false,
          },
        ],
      },
    ],
  };
}

function createReadyTests(): CreateTestDto[] {
  return [
    toCreateTestDto(createExampleForm()),
    {
      title: "Основы баз данных",
      description: "Тест по SQL и базам данных",
      questions: [
        {
          text: "Что такое первичный ключ?",
          type: 0,
          answerOptions: [
            { text: "Поле, уникально идентифицирующее запись", isCorrect: true },
            { text: "Команда удаления таблицы", isCorrect: false },
            { text: "Тип пользовательского интерфейса", isCorrect: false },
          ],
        },
        {
          text: "Какие команды относятся к SQL?",
          type: 1,
          answerOptions: [
            { text: "SELECT", isCorrect: true },
            { text: "INSERT", isCorrect: true },
            { text: "console.log", isCorrect: false },
            { text: "UPDATE", isCorrect: true },
          ],
        },
      ],
    },
    {
      title: "Основы веб-разработки",
      description: "Тест по frontend и backend понятиям",
      questions: [
        {
          text: "Что делает HTTP GET?",
          type: 0,
          answerOptions: [
            { text: "Получает данные", isCorrect: true },
            { text: "Удаляет данные", isCorrect: false },
            { text: "Обновляет данные", isCorrect: false },
          ],
        },
        {
          text: "Какие технологии часто используются на frontend?",
          type: 1,
          answerOptions: [
            { text: "HTML", isCorrect: true },
            { text: "CSS", isCorrect: true },
            { text: "React", isCorrect: true },
            { text: "SQLite", isCorrect: false },
          ],
        },
      ],
    },
  ];
}

async function readApiError(response: Response, fallback: string) {
  try {
    const data = (await response.clone().json()) as { error?: string };
    return data.error || fallback;
  } catch {
    try {
      const text = await response.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
}

async function getTests() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(await readApiError(response, "Не удалось загрузить список тестов."));
  }

  return (await response.json()) as TestListDto[];
}

async function getTest(id: string) {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error(await readApiError(response, "Не удалось загрузить тест."));
  }

  return (await response.json()) as TestDetailsDto;
}

async function createTest(dto: CreateTestDto) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Не удалось создать тест."));
  }

  return (await response.json()) as TestDetailsDto;
}

async function updateTest(id: string, dto: CreateTestDto) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Не удалось сохранить изменения."));
  }
}

async function deleteTest(id: string) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Не удалось удалить тест."));
  }
}

async function submitTest(testId: string, dto: SubmitTestDto) {
  const response = await fetch(`${API_URL}/${testId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Не удалось отправить ответы."));
  }

  return (await response.json()) as TestResultDto;
}

function toCreateTestDto(form: TestForm): CreateTestDto {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    questions: form.questions.map((question) => ({
      text: question.text.trim(),
      type: question.type,
      answerOptions: question.answerOptions.map((answer) => ({
        text: answer.text.trim(),
        isCorrect: answer.isCorrect,
      })),
    })),
  };
}

function toTestForm(test: TestDetailsDto): TestForm {
  return {
    title: test.title,
    description: test.description ?? "",
    questions: test.questions.map((question) => ({
      localId: createLocalId(),
      text: question.text,
      type: question.type,
      answerOptions: question.answerOptions.map((answer) => ({
        localId: createLocalId(),
        text: answer.text,
        isCorrect: answer.isCorrect,
      })),
    })),
  };
}

function validateForm(form: TestForm) {
  if (!form.title.trim()) {
    return "Введите название теста.";
  }

  if (form.questions.length === 0) {
    return "Добавьте хотя бы один вопрос.";
  }

  for (const [questionIndex, question] of form.questions.entries()) {
    const questionNumber = questionIndex + 1;

    if (!question.text.trim()) {
      return `Введите текст вопроса ${questionNumber}.`;
    }

    if (question.answerOptions.length < 2) {
      return `У вопроса ${questionNumber} должно быть минимум 2 варианта ответа.`;
    }

    for (const [answerIndex, answer] of question.answerOptions.entries()) {
      if (!answer.text.trim()) {
        return `Введите текст варианта ${answerIndex + 1} в вопросе ${questionNumber}.`;
      }
    }

    const correctCount = question.answerOptions.filter((answer) => answer.isCorrect).length;

    if (correctCount === 0) {
      return `У вопроса ${questionNumber} должен быть хотя бы один правильный ответ.`;
    }

    if (question.type === 0 && correctCount !== 1) {
      return `У вопроса ${questionNumber} с одиночным выбором должен быть ровно один правильный ответ.`;
    }
  }

  return "";
}

function App() {
  const [tests, setTests] = useState<TestListDto[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestDetailsDto | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<TestResultDto | null>(null);
  const [form, setForm] = useState<TestForm>(createEmptyForm);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLElement | null>(null);
  const selectedTestRef = useRef<HTMLElement | null>(null);

  async function loadTests() {
    setError("");

    try {
      setTests(await getTests());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки тестов.");
    }
  }

  async function openTest(id: string) {
    setError("");
    setMessage("");
    setResult(null);
    setAnswers({});

    try {
      setSelectedTest(await getTest(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки теста.");
    }
  }

  async function handleCreateTest() {
    setError("");
    setMessage("");

    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const dto = toCreateTestDto(form);

      if (editingTestId) {
        await updateTest(editingTestId, dto);

        if (selectedTest?.id === editingTestId) {
          setSelectedTest(await getTest(editingTestId));
        }

        setAnswers({});
        setResult(null);
        setMessage("Изменения сохранены.");
        setEditingTestId(null);
      } else {
        const createdTest = await createTest(dto);
        setMessage("Тест создан.");
        setSelectedTest(createdTest);
      }

      setResult(null);
      setAnswers({});
      setForm(createEmptyForm());
      await loadTests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingTestId
            ? "Ошибка сохранения изменений."
            : "Ошибка создания теста.",
      );
    }
  }

  async function handleEditTest(id: string) {
    setError("");
    setMessage("");
    setResult(null);
    setAnswers({});

    try {
      const test = await getTest(id);
      setForm(toTestForm(test));
      setEditingTestId(id);
      setMessage("Тест загружен для редактирования.");
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки теста для редактирования.");
    }
  }

  function cancelEditing() {
    setEditingTestId(null);
    setForm(createEmptyForm());
    setError("");
    setMessage("");
  }

  async function handleDeleteTest(test: TestListDto) {
    if (!window.confirm(`Удалить тест «${test.title}»?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteTest(test.id);

      if (selectedTest?.id === test.id) {
        setSelectedTest(null);
        setResult(null);
        setAnswers({});
      }

      if (editingTestId === test.id) {
        setEditingTestId(null);
        setForm(createEmptyForm());
      }

      await loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления теста.");
    }
  }

  async function handleDeleteAllTests() {
    if (tests.length === 0) {
      return;
    }

    if (!window.confirm("Удалить все тесты?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      for (const test of tests) {
        await deleteTest(test.id);
      }

      setSelectedTest(null);
      setResult(null);
      setAnswers({});
      setEditingTestId(null);
      setForm(createEmptyForm());
      setMessage("Все тесты удалены.");
      await loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления тестов.");
      await loadTests();
    }
  }

  async function handleCreateReadyTests() {
    setError("");
    setMessage("");

    try {
      for (const readyTest of createReadyTests()) {
        await createTest(readyTest);
      }

      setMessage("Готовые тесты созданы.");
      await loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания готовых тестов.");
    }
  }

  async function handleSubmitTest() {
    if (!selectedTest) {
      return;
    }

    setError("");
    setMessage("");
    setResult(null);

    const payload: SubmitTestDto = {
      answers: selectedTest.questions.map((question) => ({
        questionId: question.id,
        selectedAnswerOptionIds: answers[question.id] ?? [],
      })),
    };

    try {
      setResult(await submitTest(selectedTest.id, payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка прохождения теста.");
    }
  }

  function addQuestion() {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, createEmptyQuestion()],
    }));
  }

  function removeQuestion(questionId: string) {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((question) => question.localId !== questionId),
    }));
  }

  function updateQuestionText(questionId: string, text: string) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.localId === questionId ? { ...question, text } : question,
      ),
    }));
  }

  function updateQuestionType(questionId: string, type: QuestionType) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.localId !== questionId) {
          return question;
        }

        if (type === 1) {
          return { ...question, type };
        }

        let firstCorrectFound = false;

        return {
          ...question,
          type,
          answerOptions: question.answerOptions.map((answer) => {
            if (!answer.isCorrect || firstCorrectFound) {
              return { ...answer, isCorrect: false };
            }

            firstCorrectFound = true;
            return answer;
          }),
        };
      }),
    }));
  }

  function addAnswer(questionId: string) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.localId === questionId
          ? { ...question, answerOptions: [...question.answerOptions, createEmptyAnswer()] }
          : question,
      ),
    }));
  }

  function removeAnswer(questionId: string, answerId: string) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.localId === questionId
          ? {
              ...question,
              answerOptions: question.answerOptions.filter((answer) => answer.localId !== answerId),
            }
          : question,
      ),
    }));
  }

  function updateAnswerText(questionId: string, answerId: string, text: string) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.localId === questionId
          ? {
              ...question,
              answerOptions: question.answerOptions.map((answer) =>
                answer.localId === answerId ? { ...answer, text } : answer,
              ),
            }
          : question,
      ),
    }));
  }

  function toggleCorrectAnswer(questionId: string, answerId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.localId !== questionId) {
          return question;
        }

        return {
          ...question,
          answerOptions: question.answerOptions.map((answer) => {
            if (question.type === 0) {
              return {
                ...answer,
                isCorrect: checked && answer.localId === answerId,
              };
            }

            return answer.localId === answerId ? { ...answer, isCorrect: checked } : answer;
          }),
        };
      }),
    }));
  }

  function toggleAnswer(question: QuestionDto, answerId: string) {
    setAnswers((current) => {
      const selectedIds = current[question.id] ?? [];

      if (question.type === 0) {
        return {
          ...current,
          [question.id]: [answerId],
        };
      }

      return {
        ...current,
        [question.id]: selectedIds.includes(answerId)
          ? selectedIds.filter((id) => id !== answerId)
          : [...selectedIds, answerId],
      };
    });
  }

  function fillExample() {
    setError("");
    setMessage("");
    setForm(createExampleForm());
  }

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      selectedTestRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedTest]);

  return (
    <main className="page">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Test Management</p>
          <h1>Управление тестами</h1>
          <p className="subtitle">
            Создание, редактирование и прохождение тестов с автоматическим подсчётом результата.
          </p>
        </div>
        <div className="hero-actions">
          <div className="hero-actions-row">
            <button type="button" className="secondary" onClick={loadTests}>
              Обновить список
            </button>
            <button type="button" onClick={handleCreateReadyTests}>
              Создать готовые тесты
            </button>
          </div>
          <button
            type="button"
            className="danger"
            onClick={handleDeleteAllTests}
            disabled={tests.length === 0}
          >
            Удалить все тесты
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="layout">
        <section className="card" ref={formRef}>
          <div className="section-heading">
            <h2>{editingTestId ? "Редактирование теста" : "Создание теста"}</h2>
            <div className="actions">
              <button type="button" className="secondary" onClick={fillExample}>
                Заполнить примером
              </button>
              {editingTestId && (
                <button type="button" className="secondary" onClick={cancelEditing}>
                  Отменить редактирование
                </button>
              )}
            </div>
          </div>

          <label>
            Название теста
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Например: Основы программирования"
            />
          </label>

          <label>
            Описание теста
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Краткое описание"
            />
          </label>

          <div className="form-block">
            <div className="section-heading">
              <h3>Вопросы</h3>
              <button type="button" className="secondary" onClick={addQuestion}>
                Добавить вопрос
              </button>
            </div>

            {form.questions.map((question, questionIndex) => (
              <div className="question-editor" key={question.localId}>
                <div className="question-editor-header">
                  <h4>Вопрос {questionIndex + 1}</h4>
                  <button
                    type="button"
                    className="danger subtle"
                    onClick={() => removeQuestion(question.localId)}
                    disabled={form.questions.length === 1}
                  >
                    Удалить вопрос
                  </button>
                </div>

                <label>
                  Текст вопроса
                  <input
                    value={question.text}
                    onChange={(event) => updateQuestionText(question.localId, event.target.value)}
                    placeholder="Введите вопрос"
                  />
                </label>

                <label>
                  Тип вопроса
                  <select
                    value={question.type}
                    onChange={(event) =>
                      updateQuestionType(question.localId, Number(event.target.value) as QuestionType)
                    }
                  >
                    <option value={0}>Одиночный выбор</option>
                    <option value={1}>Множественный выбор</option>
                  </select>
                </label>

                <div className="answers-editor">
                  <div className="section-heading compact">
                    <h5>Варианты ответов</h5>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => addAnswer(question.localId)}
                    >
                      Добавить вариант ответа
                    </button>
                  </div>

                  {question.answerOptions.map((answer, answerIndex) => (
                    <div className="answer-editor" key={answer.localId}>
                      <label className="correct-checkbox">
                        <input
                          type="checkbox"
                          checked={answer.isCorrect}
                          onChange={(event) =>
                            toggleCorrectAnswer(
                              question.localId,
                              answer.localId,
                              event.target.checked,
                            )
                          }
                        />
                        Правильный
                      </label>

                      <input
                        value={answer.text}
                        onChange={(event) =>
                          updateAnswerText(question.localId, answer.localId, event.target.value)
                        }
                        placeholder={`Вариант ${answerIndex + 1}`}
                      />

                      <button
                        type="button"
                        className="danger subtle"
                        onClick={() => removeAnswer(question.localId, answer.localId)}
                        disabled={question.answerOptions.length === 2}
                      >
                        Удалить вариант ответа
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleCreateTest}>
            {editingTestId ? "Сохранить изменения" : "Создать тест"}
          </button>
        </section>

        <aside className="right-column">
          <section className="card">
            <div className="section-heading">
              <h2>Список тестов</h2>
            </div>

            {tests.length === 0 && <p className="muted">Тестов пока нет.</p>}

            <div className="test-list">
              {tests.map((test) => (
                <div className="test-item" key={test.id}>
                  <div>
                    <h3>{test.title}</h3>
                    <p>{test.description || "Без описания"}</p>
                    <span>Вопросов: {test.questionsCount}</span>
                  </div>

                  <div className="actions">
                    <button type="button" onClick={() => openTest(test.id)}>
                      Открыть
                    </button>
                    <button type="button" className="secondary" onClick={() => handleEditTest(test.id)}>
                      Редактировать
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDeleteTest(test)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {selectedTest && (
            <section className="card selected-test" ref={selectedTestRef}>
              <div className="section-heading">
                <div>
                  <h2>{selectedTest.title}</h2>
                  <p className="muted">{selectedTest.description || "Без описания"}</p>
                </div>
              </div>

              <div className="questions">
                {selectedTest.questions.map((question, questionIndex) => (
                  <div className="question" key={question.id}>
                    <h3>
                      {questionIndex + 1}. {question.text}
                    </h3>
                    <p className="muted">
                      Тип: {question.type === 0 ? "Одиночный выбор" : "Множественный выбор"}
                    </p>

                    <div className="answer-list">
                      {question.answerOptions.map((answer) => {
                        const selected = answers[question.id]?.includes(answer.id) ?? false;

                        return (
                          <label className="answer" key={answer.id}>
                            <input
                              type={question.type === 0 ? "radio" : "checkbox"}
                              name={question.id}
                              checked={selected}
                              onChange={() => toggleAnswer(question, answer.id)}
                            />
                            {answer.text}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="submit-test-button"
                onClick={handleSubmitTest}
              >
                Завершить тест
              </button>

              {result && (
                <div className="result">
                  <strong>
                    Результат: {result.score} / {result.maxScore}
                  </strong>
                  <span>Процент: {result.percentage}%</span>
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

export default App;
