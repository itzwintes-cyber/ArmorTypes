/** Доп. раунды: сверху название конкретной машины, в ответе — категория (тип), не модель */
(function () {
  const D = window.GAME_DATA;
  if (!D) return;

  D.rounds = D.rounds.concat([
    { title: "T-72B3", image: null, answers: { type: "Танк ОБТ", era: "Современность", country: "Россия" } },
    { title: "F-16C", image: null, answers: { type: "Истребитель", era: "Современность", country: "Соединённые Штаты" } },
    { title: "Leopard 2A6", image: null, answers: { type: "Танк ОБТ", era: "Современность", country: "Германия" } },
    { title: "Су-35С", image: null, answers: { type: "Истребитель", era: "Современность", country: "Россия" } },
    { title: "HIMARS", image: null, answers: { type: "РСЗО", era: "Современность", country: "Соединённые Штаты" } },
    { title: "БМП-2", image: null, answers: { type: "БМП", era: "Холодная война", country: "Советский Союз (СССР)" } },
    { title: "AH-64 Apache", image: null, answers: { type: "Вертолёт ударный", era: "Современность", country: "Соединённые Штаты" } },
    { title: "PzH 2000", image: null, answers: { type: "САУ", era: "Современность", country: "Германия" } },
    { title: "J-20", image: null, answers: { type: "Истребитель", era: "Современность", country: "Китай" } },
    { title: "Challenger 2", image: null, answers: { type: "Танк ОБТ", era: "Современность", country: "Великобритания" } },
    { title: "2S19 Мста", image: null, answers: { type: "САУ", era: "Холодная война", country: "Россия" } },
    { title: "Rafale", image: null, answers: { type: "Истребитель", era: "Современность", country: "Франция" } },
    { title: "Merkava Mk4", image: null, answers: { type: "Танк ОБТ", era: "Современность", country: "Израиль" } },
    { title: "Type 054A", image: null, answers: { type: "Фрегат", era: "Современность", country: "Китай" } },
    { title: "Virginia SSN", image: null, answers: { type: "Подлодка АПЛ", era: "Современность", country: "Соединённые Штаты" } },
    { title: "Ту-160", image: null, answers: { type: "Бомбард. стратег.", era: "Холодная война", country: "Россия" } },
    { title: "ИС-2", image: null, answers: { type: "Танк тяжёлый", era: "Вторая мировая", country: "Советский Союз (СССР)" } },
    { title: "Panther", image: null, answers: { type: "Танк средний", era: "Вторая мировая", country: "Германия" } },
    { title: "A-10 Thunderbolt", image: null, answers: { type: "Штурмовик", era: "Холодная война", country: "Соединённые Штаты" } },
    { title: "CV90", image: null, answers: { type: "БМП", era: "Современность", country: "Швеция" } },
    { title: "Панцирь-С1", image: null, answers: { type: "ЗРК полевой", era: "Современность", country: "Россия" } },
    { title: "Байрактар TB2", image: null, answers: { type: "БПЛА ударный", era: "Современность", country: "Турция" } },
    { title: "Адмирал Горшков", image: null, answers: { type: "Фрегат", era: "Современность", country: "Россия" } },
    { title: "Zumwalt", image: null, answers: { type: "Эсминец", era: "Современность", country: "Соединённые Штаты" } },
    { title: "Оса", image: null, answers: { type: "ЗРК полевой", era: "Холодная война", country: "Советский Союз (СССР)" } },
    { title: "Stryker", image: null, answers: { type: "БТР", era: "Современность", country: "Соединённые Штаты" } },
    { title: "Ми-24", image: null, answers: { type: "Вертолёт ударный", era: "Холодная война", country: "Советский Союз (СССР)" } },
    { title: "Ил-2", image: null, answers: { type: "Штурмовик", era: "Вторая мировая", country: "Советский Союз (СССР)" } },
    { title: "Авианосец Nimitz", image: null, answers: { type: "Авианосец", era: "Современность", country: "Соединённые Штаты" } },
  ]);
})();
