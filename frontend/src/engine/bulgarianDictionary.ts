// Bulgarian Words Dictionary - Кръстословица
import { WordClue } from '../types';

// Easy words - common Bulgarian words
const easyWords: WordClue[] = [
  { word: 'ВОДА', clue: 'Безцветна течност за пиене', difficulty: 'easy' },
  { word: 'ОГЪН', clue: 'Гори и свети', difficulty: 'easy' },
  { word: 'СЛЪНЦЕ', clue: 'Небесно тяло, което ни топли', difficulty: 'easy' },
  { word: 'ЛУНА', clue: 'Свети нощем на небето', difficulty: 'easy' },
  { word: 'ДЪРВО', clue: 'Расте в гората', difficulty: 'easy' },
  { word: 'КЪЩА', clue: 'Място за живеене', difficulty: 'easy' },
  { word: 'МАСА', clue: 'Мебел за хранене', difficulty: 'easy' },
  { word: 'СТОЛ', clue: 'Мебел за сядане', difficulty: 'easy' },
  { word: 'КНИГА', clue: 'Четем я с интерес', difficulty: 'easy' },
  { word: 'РЕКА', clue: 'Тече към морето', difficulty: 'easy' },
  { word: 'МОРЕ', clue: 'Голям воден басейн', difficulty: 'easy' },
  { word: 'ГОРА', clue: 'Много дървета заедно', difficulty: 'easy' },
  { word: 'КОЛА', clue: 'Превозно средство', difficulty: 'easy' },
  { word: 'ХЛЯБ', clue: 'Основна храна', difficulty: 'easy' },
  { word: 'МЛЯКО', clue: 'Бяла напитка от крава', difficulty: 'easy' },
  { word: 'СИРЕНЕ', clue: 'Млечен продукт', difficulty: 'easy' },
  { word: 'ЯБЪЛКА', clue: 'Червен или зелен плод', difficulty: 'easy' },
  { word: 'КРУША', clue: 'Сладък плод', difficulty: 'easy' },
  { word: 'КУЧЕ', clue: 'Верен домашен любимец', difficulty: 'easy' },
  { word: 'КОТКА', clue: 'Мърка и лови мишки', difficulty: 'easy' },
  { word: 'ПТИЦА', clue: 'Лети и пее', difficulty: 'easy' },
  { word: 'РИБА', clue: 'Плува във водата', difficulty: 'easy' },
  { word: 'ЗЕМЯ', clue: 'Нашата планета', difficulty: 'easy' },
  { word: 'НЕБЕ', clue: 'Синьо над нас', difficulty: 'easy' },
  { word: 'ЗВЕЗДА', clue: 'Свети нощем', difficulty: 'easy' },
  { word: 'ЦВЕТЕ', clue: 'Расте в градината', difficulty: 'easy' },
  { word: 'ТРЕВА', clue: 'Зелена в ливадата', difficulty: 'easy' },
  { word: 'КАМЪК', clue: 'Твърд минерал', difficulty: 'easy' },
  { word: 'ПЯСЪК', clue: 'Има го на плажа', difficulty: 'easy' },
  { word: 'СНЯГ', clue: 'Пада зимата', difficulty: 'easy' },
  { word: 'ДЪЖД', clue: 'Вали от облаците', difficulty: 'easy' },
  { word: 'ВЯТЪР', clue: 'Духа силно', difficulty: 'easy' },
  { word: 'ОБЛАК', clue: 'Бял на небето', difficulty: 'easy' },
  { word: 'ПРОЛЕТ', clue: 'Сезон след зимата', difficulty: 'easy' },
  { word: 'ЛЯТО', clue: 'Топъл сезон', difficulty: 'easy' },
  { word: 'ЕСЕН', clue: 'Листата падат', difficulty: 'easy' },
  { word: 'ЗИМА', clue: 'Студен сезон', difficulty: 'easy' },
];

// Medium words - less common Bulgarian words
const mediumWords: WordClue[] = [
  { word: 'ИСТОРИЯ', clue: 'Наука за миналото', difficulty: 'medium' },
  { word: 'БЪДЕЩЕ', clue: 'Времето което предстои', difficulty: 'medium' },
  { word: 'ПРИЯТЕЛ', clue: 'Близък човек', difficulty: 'medium' },
  { word: 'СВОБОДА', clue: 'Липса на ограничения', difficulty: 'medium' },
  { word: 'ЩАСТИЕ', clue: 'Чувство на радост', difficulty: 'medium' },
  { word: 'НАДЕЖДА', clue: 'Вяра в доброто', difficulty: 'medium' },
  { word: 'МЪДРОСТ', clue: 'Житейски опит', difficulty: 'medium' },
  { word: 'ПЛАНЕТА', clue: 'Небесно тяло около звезда', difficulty: 'medium' },
  { word: 'МУЗИКА', clue: 'Изкуство от звуци', difficulty: 'medium' },
  { word: 'КАРТИНА', clue: 'Произведение на художник', difficulty: 'medium' },
  { word: 'ТЕАТЪР', clue: 'Място за представления', difficulty: 'medium' },
  { word: 'ФИЛМ', clue: 'Движещи се картини', difficulty: 'medium' },
  { word: 'ПИСАТЕЛ', clue: 'Създава книги', difficulty: 'medium' },
  { word: 'УЧИТЕЛ', clue: 'Преподава знания', difficulty: 'medium' },
  { word: 'ЛЕКАР', clue: 'Лекува болни', difficulty: 'medium' },
  { word: 'АРХИТЕКТ', clue: 'Проектира сгради', difficulty: 'medium' },
  { word: 'ИНЖЕНЕР', clue: 'Създава машини', difficulty: 'medium' },
  { word: 'ЕЗЕРО', clue: 'Воден басейн сред суша', difficulty: 'medium' },
  { word: 'ВОДОПАД', clue: 'Вода пада от високо', difficulty: 'medium' },
  { word: 'ОСТРОВ', clue: 'Суша заобиколена от вода', difficulty: 'medium' },
  { word: 'ПЛАНИНА', clue: 'Високо земно възвишение', difficulty: 'medium' },
  { word: 'ДОЛИНА', clue: 'Ниска земя между планини', difficulty: 'medium' },
  { word: 'ПУСТИНЯ', clue: 'Суха безводна местност', difficulty: 'medium' },
  { word: 'ДЖУНГЛА', clue: 'Гъста тропическа гора', difficulty: 'medium' },
  { word: 'ОКЕАН', clue: 'Най-голямото водно пространство', difficulty: 'medium' },
  { word: 'КОМПЮТЪР', clue: 'Електронна машина', difficulty: 'medium' },
  { word: 'ТЕЛЕФОН', clue: 'Средство за разговор', difficulty: 'medium' },
  { word: 'ИНТЕРНЕТ', clue: 'Световна мрежа', difficulty: 'medium' },
  { word: 'ПРОГРАМА', clue: 'Софтуер за компютър', difficulty: 'medium' },
  { word: 'ЕКРАН', clue: 'Показва изображения', difficulty: 'medium' },
];

// Hard words - complex Bulgarian words
const hardWords: WordClue[] = [
  { word: 'ФИЛОСОФИЯ', clue: 'Наука за мисленето', difficulty: 'hard' },
  { word: 'ДЕМОКРАЦИЯ', clue: 'Народовластие', difficulty: 'hard' },
  { word: 'РЕПУБЛИКА', clue: 'Форма на управление', difficulty: 'hard' },
  { word: 'КОНСТИТУЦИЯ', clue: 'Основен закон', difficulty: 'hard' },
  { word: 'ПАРЛАМЕНТ', clue: 'Законодателен орган', difficulty: 'hard' },
  { word: 'ПРАВИТЕЛСТВО', clue: 'Изпълнителна власт', difficulty: 'hard' },
  { word: 'УНИВЕРСИТЕТ', clue: 'Висше учебно заведение', difficulty: 'hard' },
  { word: 'ЛАБОРАТОРИЯ', clue: 'Място за експерименти', difficulty: 'hard' },
  { word: 'ЕКСПЕРИМЕНТ', clue: 'Научен опит', difficulty: 'hard' },
  { word: 'ХИПОТЕЗА', clue: 'Научно предположение', difficulty: 'hard' },
  { word: 'ТЕОРИЯ', clue: 'Научно обяснение', difficulty: 'hard' },
  { word: 'ПРАКТИКА', clue: 'Приложение на знания', difficulty: 'hard' },
  { word: 'ИКОНОМИКА', clue: 'Наука за стопанството', difficulty: 'hard' },
  { word: 'ПСИХОЛОГИЯ', clue: 'Наука за душата', difficulty: 'hard' },
  { word: 'БИОЛОГИЯ', clue: 'Наука за живота', difficulty: 'hard' },
  { word: 'ГЕОГРАФИЯ', clue: 'Наука за Земята', difficulty: 'hard' },
  { word: 'АСТРОНОМИЯ', clue: 'Наука за звездите', difficulty: 'hard' },
  { word: 'МАТЕМАТИКА', clue: 'Наука за числата', difficulty: 'hard' },
  { word: 'ЛИТЕРАТУРА', clue: 'Писмено творчество', difficulty: 'hard' },
  { word: 'АРХИТЕКТУРА', clue: 'Изкуство да се строи', difficulty: 'hard' },
  { word: 'СКУЛПТУРА', clue: 'Триизмерно изкуство', difficulty: 'hard' },
  { word: 'ЖИВОПИС', clue: 'Изкуство на рисуването', difficulty: 'hard' },
  { word: 'СИМФОНИЯ', clue: 'Голямо музикално произведение', difficulty: 'hard' },
  { word: 'КОНЦЕРТ', clue: 'Музикално изпълнение', difficulty: 'hard' },
  { word: 'ФЕСТИВАЛ', clue: 'Празнично събитие', difficulty: 'hard' },
  { word: 'ТРАДИЦИЯ', clue: 'Обичай от миналото', difficulty: 'hard' },
  { word: 'КУЛТУРА', clue: 'Духовни ценности', difficulty: 'hard' },
  { word: 'ЦИВИЛИЗАЦИЯ', clue: 'Човешко развитие', difficulty: 'hard' },
  { word: 'РЕВОЛЮЦИЯ', clue: 'Коренна промяна', difficulty: 'hard' },
  { word: 'ЕВОЛЮЦИЯ', clue: 'Постепенно развитие', difficulty: 'hard' },
];

export const bulgarianDictionary: WordClue[] = [
  ...easyWords,
  ...mediumWords,
  ...hardWords,
];

export function getWordsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): WordClue[] {
  switch (difficulty) {
    case 'easy':
      return easyWords;
    case 'medium':
      return [...easyWords, ...mediumWords];
    case 'hard':
      return bulgarianDictionary;
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
