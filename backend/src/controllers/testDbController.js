import { Admin, Event, Student, Paragraph, Result, Log } from '../models/index.js';

export const verifyModels = async (req, res, next) => {
  try {
    const modelsInfo = {
      Admin: {
        registered: !!Admin,
        schemaKeys: Object.keys(Admin.schema.paths),
      },
      Event: {
        registered: !!Event,
        schemaKeys: Object.keys(Event.schema.paths),
      },
      Student: {
        registered: !!Student,
        schemaKeys: Object.keys(Student.schema.paths),
      },
      Paragraph: {
        registered: !!Paragraph,
        schemaKeys: Object.keys(Paragraph.schema.paths),
      },
      Result: {
        registered: !!Result,
        schemaKeys: Object.keys(Result.schema.paths),
      },
      Log: {
        registered: !!Log,
        schemaKeys: Object.keys(Log.schema.paths),
      },
    };

    // Instantiate a temporary result to test pre-save calculation logic
    const dummyResult = new Result({
      studentId: '60d5ecb8b5c9c22b1c8e4f1a',
      eventId: '60d5ecb8b5c9c22b1c8e4f1b',
      grossWpm: 75,
      netWpm: 70,
      accuracy: 95,
      mistakes: 3,
    });
    
    // Trigger pre-save hooks manually for validation testing
    dummyResult.schema.s.hooks.execPre('save', dummyResult, () => {});

    res.status(200).json({
      success: true,
      message: 'All 6 Mongoose models successfully verified!',
      models: modelsInfo,
      scoreFormulaTest: {
        input: { netWpm: 70, accuracy: 95, mistakes: 3 },
        calculatedScore: dummyResult.finalScore,
        expectedScore: 70 * 10 + 95 - 3 * 5, // 700 + 95 - 15 = 780
      },
    });
  } catch (err) {
    next(err);
  }
};
