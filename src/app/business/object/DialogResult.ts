export class DialogResult {
  action: DialogAction;
  obj: any;

  constructor(action: DialogAction, obj?: any) {
    this.action = action;
    this.obj = obj;
  }
}

export enum DialogAction {
  SETTINGS_CHANGE, // настройки были изменены
  SAVE,            // сохранение изменений
  OK,              // для подтверждения действий
  CANCEL,          // отмена всех действий
  DELETE,          // удаление объекта
  COMPLETE,        // завершение задачи
  ACTIVATE         // возврат задачи в активное состояние (нерешенная)
}
