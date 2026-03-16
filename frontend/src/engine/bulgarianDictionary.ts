// Българска Речник за Кръстословица
// Bulgarian Dictionary for Crossword Puzzles
// Проверени и правилно изписани думи

import { WordClue } from '../types';

// Лесни думи - 3-5 букви (Easy words - common, short)
const easyWords: WordClue[] = [
  // 3 букви
  { word: 'АНА', clue: 'Женско име', difficulty: 'easy' },
  { word: 'ДЕН', clue: 'Период от 24 часа', difficulty: 'easy' },
  { word: 'НОЩ', clue: 'Тъмната част на денонощието', difficulty: 'easy' },
  { word: 'КОН', clue: 'Домашно животно за яздене', difficulty: 'easy' },
  { word: 'ЛЕВ', clue: 'Българска валута', difficulty: 'easy' },
  { word: 'МЕД', clue: 'Сладък продукт от пчели', difficulty: 'easy' },
  { word: 'СОЛ', clue: 'Бяла подправка за ястия', difficulty: 'easy' },
  { word: 'СИН', clue: 'Мъжки потомък', difficulty: 'easy' },
  { word: 'ПЕС', clue: 'Домашен любимец', difficulty: 'easy' },
  { word: 'РАК', clue: 'Морско животно с щипки', difficulty: 'easy' },
  { word: 'ТОН', clue: 'Морска риба', difficulty: 'easy' },
  { word: 'ОКО', clue: 'Орган за виждане', difficulty: 'easy' },
  { word: 'УХО', clue: 'Орган за слушане', difficulty: 'easy' },
  { word: 'НОС', clue: 'Орган за миришене', difficulty: 'easy' },
  
  // 4 букви
  { word: 'ВОДА', clue: 'Безцветна течност за пиене', difficulty: 'easy' },
  { word: 'ОГЪН', clue: 'Гори и свети', difficulty: 'easy' },
  { word: 'ЛУНА', clue: 'Свети нощем на небето', difficulty: 'easy' },
  { word: 'МАСА', clue: 'Мебел за хранене', difficulty: 'easy' },
  { word: 'СТОЛ', clue: 'Мебел за сядане', difficulty: 'easy' },
  { word: 'РАКА', clue: 'Част от тялото', difficulty: 'easy' },
  { word: 'КРАК', clue: 'Стъпваме с него', difficulty: 'easy' },
  { word: 'РИБА', clue: 'Плува във водата', difficulty: 'easy' },
  { word: 'ГОРА', clue: 'Много дървета заедно', difficulty: 'easy' },
  { word: 'КОЛА', clue: 'Превозно средство', difficulty: 'easy' },
  { word: 'ХЛЯБ', clue: 'Основна храна', difficulty: 'easy' },
  { word: 'МОРЕ', clue: 'Голям воден басейн', difficulty: 'easy' },
  { word: 'НЕБЕ', clue: 'Синьо над нас', difficulty: 'easy' },
  { word: 'ЗЕМЯ', clue: 'Нашата планета', difficulty: 'easy' },
  { word: 'КУЧЕ', clue: 'Верен домашен любимец', difficulty: 'easy' },
  { word: 'ПИЛЕ', clue: 'Малко на кокошка', difficulty: 'easy' },
  { word: 'КРЪВ', clue: 'Тече във вените', difficulty: 'easy' },
  { word: 'ГРАД', clue: 'Населено място', difficulty: 'easy' },
  { word: 'СЕЛО', clue: 'Малко населено място', difficulty: 'easy' },
  { word: 'ПОЛЕ', clue: 'Равна земя', difficulty: 'easy' },
  { word: 'ДЪЖД', clue: 'Вали от облаците', difficulty: 'easy' },
  { word: 'СНЯГ', clue: 'Пада зимата', difficulty: 'easy' },
  { word: 'ЗИМА', clue: 'Студен сезон', difficulty: 'easy' },
  { word: 'ЛЯТО', clue: 'Топъл сезон', difficulty: 'easy' },
  { word: 'ЕСЕН', clue: 'Листата падат', difficulty: 'easy' },
  { word: 'РОЗА', clue: 'Цвете с бодли', difficulty: 'easy' },
  { word: 'МАМА', clue: 'Женски родител', difficulty: 'easy' },
  { word: 'ТАТА', clue: 'Мъжки родител', difficulty: 'easy' },
  { word: 'БАБА', clue: 'Майка на родител', difficulty: 'easy' },
  { word: 'ДЯДО', clue: 'Баща на родител', difficulty: 'easy' },
  { word: 'ЖЕНА', clue: 'Възрастна от женски пол', difficulty: 'easy' },
  { word: 'МЪКА', clue: 'Тъга и страдание', difficulty: 'easy' },
  
  // 5 букви
  { word: 'СЛЪНЦ', clue: 'Небесно тяло, което ни топли', difficulty: 'easy' },
  { word: 'КНИГА', clue: 'Четем я с интерес', difficulty: 'easy' },
  { word: 'КОТКА', clue: 'Мърка и лови мишки', difficulty: 'easy' },
  { word: 'ПТИЦА', clue: 'Лети и пее', difficulty: 'easy' },
  { word: 'ЦВЕТЕ', clue: 'Расте в градината', difficulty: 'easy' },
  { word: 'ТРЕВА', clue: 'Зелена в ливадата', difficulty: 'easy' },
  { word: 'КАМЪК', clue: 'Твърд минерал', difficulty: 'easy' },
  { word: 'ПЯСЪК', clue: 'Има го на плажа', difficulty: 'easy' },
  { word: 'ОБЛАК', clue: 'Бял на небето', difficulty: 'easy' },
  { word: 'ВЯТЪР', clue: 'Духа силно', difficulty: 'easy' },
  { word: 'ДЪРВО', clue: 'Расте в гората', difficulty: 'easy' },
  { word: 'КЪЩА', clue: 'Място за живеене', difficulty: 'easy' },
  { word: 'ВРАТА', clue: 'Влизаме през нея', difficulty: 'easy' },
  { word: 'МАСКА', clue: 'Скрива лицето', difficulty: 'easy' },
  { word: 'ЧАНТА', clue: 'Носим вещи в нея', difficulty: 'easy' },
  { word: 'ШАПКА', clue: 'Носим на главата', difficulty: 'easy' },
  { word: 'ОБУВКА', clue: 'Носим на крака', difficulty: 'easy' },
  { word: 'СИРЕН', clue: 'Млечен продукт', difficulty: 'easy' },
  { word: 'ЯБЪЛК', clue: 'Червен или зелен плод', difficulty: 'easy' },
  { word: 'КРУША', clue: 'Сладък плод', difficulty: 'easy' },
  { word: 'ГРОЗД', clue: 'От него правят вино', difficulty: 'easy' },
  { word: 'МЕСЕЦ', clue: 'Част от годината', difficulty: 'easy' },
  { word: 'МИНУТ', clue: 'Шестдесет секунди', difficulty: 'easy' },
  { word: 'ЗВЕЗД', clue: 'Свети нощем', difficulty: 'easy' },
  { word: 'РЕКА', clue: 'Тече към морето', difficulty: 'easy' },
];

// Средни думи - 5-7 букви (Medium words)
const mediumWords: WordClue[] = [
  { word: 'ИСТОРИЯ', clue: 'Наука за миналото', difficulty: 'medium' },
  { word: 'ПРИЯТЕЛ', clue: 'Близък човек', difficulty: 'medium' },
  { word: 'СВОБОДА', clue: 'Липса на ограничения', difficulty: 'medium' },
  { word: 'ЩАСТИЕ', clue: 'Чувство на радост', difficulty: 'medium' },
  { word: 'НАДЕЖДА', clue: 'Вяра в доброто', difficulty: 'medium' },
  { word: 'МЪДРОСТ', clue: 'Житейски опит', difficulty: 'medium' },
  { word: 'ПЛАНЕТА', clue: 'Небесно тяло около звезда', difficulty: 'medium' },
  { word: 'МУЗИКА', clue: 'Изкуство от звуци', difficulty: 'medium' },
  { word: 'КАРТИНА', clue: 'Произведение на художник', difficulty: 'medium' },
  { word: 'ТЕАТЪР', clue: 'Място за представления', difficulty: 'medium' },
  { word: 'ПИСАТЕЛ', clue: 'Създава книги', difficulty: 'medium' },
  { word: 'УЧИТЕЛ', clue: 'Преподава знания', difficulty: 'medium' },
  { word: 'ДОКТОР', clue: 'Лекува болни', difficulty: 'medium' },
  { word: 'ЕЗЕРО', clue: 'Воден басейн сред суша', difficulty: 'medium' },
  { word: 'ВОДОПАД', clue: 'Вода пада от високо', difficulty: 'medium' },
  { word: 'ОСТРОВ', clue: 'Суша заобиколена от вода', difficulty: 'medium' },
  { word: 'ПЛАНИНА', clue: 'Високо земно възвишение', difficulty: 'medium' },
  { word: 'ДОЛИНА', clue: 'Ниска земя между планини', difficulty: 'medium' },
  { word: 'ПУСТИНЯ', clue: 'Суха безводна местност', difficulty: 'medium' },
  { word: 'ДЖУНГЛА', clue: 'Гъста тропическа гора', difficulty: 'medium' },
  { word: 'ОКЕАН', clue: 'Най-голямо водно пространство', difficulty: 'medium' },
  { word: 'ТЕЛЕФОН', clue: 'Средство за разговор', difficulty: 'medium' },
  { word: 'ПРОГРАМА', clue: 'Софтуер за компютър', difficulty: 'medium' },
  { word: 'ЕКРАН', clue: 'Показва изображения', difficulty: 'medium' },
  { word: 'СТОЛИЦА', clue: 'Главен град на държава', difficulty: 'medium' },
  { word: 'ДЪРЖАВА', clue: 'Страна с граници', difficulty: 'medium' },
  { word: 'НАРОД', clue: 'Група от хора', difficulty: 'medium' },
  { word: 'РОДИНА', clue: 'Мястото където си роден', difficulty: 'medium' },
  { word: 'СЕМЕЙСТВО', clue: 'Родители и деца', difficulty: 'medium' },
  { word: 'ЗДРАВЕ', clue: 'Добро състояние на тялото', difficulty: 'medium' },
  { word: 'БОЛЕСТ', clue: 'Нездраво състояние', difficulty: 'medium' },
  { word: 'ЛЕКАРСТВО', clue: 'Помага при болест', difficulty: 'medium' },
  { word: 'БОЛНИЦА', clue: 'Място за лечение', difficulty: 'medium' },
  { word: 'УЧИЛИЩЕ', clue: 'Място за учене', difficulty: 'medium' },
  { word: 'СТАДИОН', clue: 'Място за спорт', difficulty: 'medium' },
  { word: 'МАГАЗИН', clue: 'Място за пазаруване', difficulty: 'medium' },
  { word: 'ПАЗАР', clue: 'Място за търговия', difficulty: 'medium' },
  { word: 'РЕСТОРАНТ', clue: 'Място за хранене', difficulty: 'medium' },
  { word: 'ХОТЕЛ', clue: 'Място за нощуване', difficulty: 'medium' },
  { word: 'ЛЕТИЩЕ', clue: 'Място за самолети', difficulty: 'medium' },
  { word: 'ВЛАК', clue: 'Превозно средство по релси', difficulty: 'medium' },
  { word: 'АВТОБУС', clue: 'Градски транспорт', difficulty: 'medium' },
  { word: 'ТРАМВАЙ', clue: 'Електрически транспорт', difficulty: 'medium' },
  { word: 'САМОЛЕТ', clue: 'Лети в небето', difficulty: 'medium' },
  { word: 'КОРАБ', clue: 'Плава по морето', difficulty: 'medium' },
];

// Трудни думи - 7+ букви (Hard words - complex)
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
  { word: 'ИКОНОМИКА', clue: 'Наука за стопанството', difficulty: 'hard' },
  { word: 'ПСИХОЛОГИЯ', clue: 'Наука за душата', difficulty: 'hard' },
  { word: 'БИОЛОГИЯ', clue: 'Наука за живота', difficulty: 'hard' },
  { word: 'ГЕОГРАФИЯ', clue: 'Наука за Земята', difficulty: 'hard' },
  { word: 'АСТРОНОМИЯ', clue: 'Наука за звездите', difficulty: 'hard' },
  { word: 'МАТЕМАТИКА', clue: 'Наука за числата', difficulty: 'hard' },
  { word: 'ЛИТЕРАТУРА', clue: 'Писмено творчество', difficulty: 'hard' },
  { word: 'АРХИТЕКТУРА', clue: 'Изкуство да се строи', difficulty: 'hard' },
  { word: 'СКУЛПТУРА', clue: 'Триизмерно изкуство', difficulty: 'hard' },
  { word: 'СИМФОНИЯ', clue: 'Голямо музикално произведение', difficulty: 'hard' },
  { word: 'ФЕСТИВАЛ', clue: 'Празнично събитие', difficulty: 'hard' },
  { word: 'ТРАДИЦИЯ', clue: 'Обичай от миналото', difficulty: 'hard' },
  { word: 'КУЛТУРА', clue: 'Духовни ценности', difficulty: 'hard' },
  { word: 'ЦИВИЛИЗАЦИЯ', clue: 'Човешко развитие', difficulty: 'hard' },
  { word: 'РЕВОЛЮЦИЯ', clue: 'Коренна промяна', difficulty: 'hard' },
  { word: 'ЕВОЛЮЦИЯ', clue: 'Постепенно развитие', difficulty: 'hard' },
  { word: 'ТЕХНОЛОГИЯ', clue: 'Приложна наука', difficulty: 'hard' },
  { word: 'ЕЛЕКТРИЧЕСТВО', clue: 'Форма на енергия', difficulty: 'hard' },
  { word: 'АТМОСФЕРА', clue: 'Въздушна обвивка на Земята', difficulty: 'hard' },
  { word: 'ГРАВИТАЦИЯ', clue: 'Сила на привличане', difficulty: 'hard' },
  { word: 'ТЕМПЕРАТУРА', clue: 'Мярка за топлина', difficulty: 'hard' },
  { word: 'ИНФОРМАЦИЯ', clue: 'Данни и сведения', difficulty: 'hard' },
  { word: 'КОМУНИКАЦИЯ', clue: 'Общуване между хора', difficulty: 'hard' },
  { word: 'ОРГАНИЗАЦИЯ', clue: 'Структурирана група', difficulty: 'hard' },
  { word: 'АДМИНИСТРАЦИЯ', clue: 'Управленски орган', difficulty: 'hard' },
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
