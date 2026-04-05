import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class CalendarColorsExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._signalIds = [];

        this._calendar = Main.panel.statusArea.dateMenu._calendar;
        this._menu = Main.panel.statusArea.dateMenu.menu;

        // Refresh when the calendar popup opens.
        this._signalIds.push([
            this._menu,
            this._menu.connect('open-state-changed', (_menu, isOpen) => {
                if (isOpen)
                    this._refresh();
            }),
        ]);

        // Refresh on month navigation and day selection.
        this._signalIds.push([
            this._calendar,
            this._calendar.connect('selected-date-changed', () => {
                this._refresh();
            }),
        ]);

        // Refresh when the event source syncs new events.
        const eventSource = this._calendar._eventSource;
        if (eventSource) {
            this._signalIds.push([
                eventSource,
                eventSource.connect('changed', () => {
                    this._refresh();
                }),
            ]);
        }

        // Refresh when the user changes preferences.
        this._signalIds.push([
            this._settings,
            this._settings.connect('changed', () => this._refresh()),
        ]);

        // Initial refresh in case the extension is enabled while the calendar is open.
        this._refresh();
    }

    disable() {
        for (const [obj, id] of this._signalIds)
            obj.disconnect(id);
        this._signalIds = [];

        this._clearStyles();

        this._calendar = null;
        this._menu = null;
        this._settings = null;
    }

    // ------------------------------------------------------------------ //
    // Private helpers
    // ------------------------------------------------------------------ //

    _getHolidaySet() {
        const dates = this._settings.get_strv('holiday-dates');
        return new Set(dates);
    }

    _formatDate(jsDate) {
        const y = jsDate.getFullYear();
        const m = String(jsDate.getMonth() + 1).padStart(2, '0');
        const d = String(jsDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    _classifyDate(jsDate, holidaySet) {
        const formatted = this._formatDate(jsDate);

        if (this._settings.get_boolean('enable-holiday-highlight') &&
            holidaySet.has(formatted))
            return 'holiday';

        const eventSource = this._calendar._eventSource;
        if (this._settings.get_boolean('enable-event-highlight') &&
            eventSource && eventSource.hasEvents(jsDate))
            return 'event';

        if (this._settings.get_boolean('enable-weekend-highlight')) {
            const day = jsDate.getDay();
            if (day === 0 || day === 6)
                return 'weekend';
        }

        return null;
    }

    _inlineStyleFor(type) {
        switch (type) {
        case 'weekend': {
            const color = this._settings.get_string('weekend-color');
            return `color: ${color};`;
        }
        case 'holiday': {
            const color = this._settings.get_string('holiday-color');
            return `background-color: ${color}; border-radius: 9999px;`;
        }
        case 'event': {
            const color = this._settings.get_string('event-color');
            return `box-shadow: inset 0 -2px 0 0 ${color};`;
        }
        default:
            return '';
        }
    }

    _refresh() {
        const buttons = this._calendar._buttons;
        if (!buttons || buttons.length === 0)
            return;

        const holidaySet = this._getHolidaySet();

        for (const button of buttons) {
            if (!button._date)
                continue;

            button.set_style('');

            const type = this._classifyDate(button._date, holidaySet);
            if (type)
                button.set_style(this._inlineStyleFor(type));
        }
    }

    _clearStyles() {
        const buttons = this._calendar?._buttons;
        if (!buttons)
            return;

        for (const button of buttons)
            button.set_style('');
    }
}
