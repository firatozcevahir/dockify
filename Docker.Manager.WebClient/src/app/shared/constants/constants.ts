
export class MyConstants {
    static readonly DATE_FMT = 'dd.MM.yyyy';
    static readonly TIME_FMT = 'HH:mm';
    // date:'yyyy-MM-dd HH:mm a z':'+0900'}}
    static readonly DATE_TIME_FMT = `${MyConstants.DATE_FMT} HH:mm`;

    static readonly DATABSE_PATTERN = '^\S+\w{8,32}\S{1,}$';

    static readonly EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

    static readonly TWITTER_PATTERN = '^@[A-Za-z0-9_]{1,15}$';

    static readonly NUMBER_PATTERN = '^[0-9]$';

    static readonly FLOAT_PATTERN = '^(([1-9]*)|(([1-9]*)\.([0-9]*)))$';

    static readonly USER_NAME_PATTERN = '^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$';

    static readonly PHONE_PATTERN = '^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$';  // ^[2-9]\d{2}-\d{3}-\d{4}$   ^\(\d{3}\)\s\d{3}-\d{4}$

    static readonly ZIPCODE_PATTERN = '[A-Za-z]{5}$';

    static readonly MEDIUM_PASSWORD = '^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\W).{6,20}$';

    static readonly IP_ADDRESS = '^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$';

    static readonly MAC_ADDRESS = '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$';  // 00:02:02:34:72:a5
                                // ^[a-fA-F0-9:]{17}|[a-fA-F0-9]{12}$

    static readonly modalConfiglg: { backdrop: 'static', keyboard: false, class: 'modal-lg' };
    static readonly modalConfigsm: { backdrop: 'static', keyboard: false, class: 'modal-sm' };
}

export class Guid {
    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            c => {
                // tslint:disable-next-line:no-bitwise
                //  const r = Math.random() * 16 | 0;
                // tslint:disable-next-line:no-bitwise
                //   const v = c === 'x' ? r : (r & 0x3 | 0x8);

                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);

                return v.toString(16);
            });
    }
}
