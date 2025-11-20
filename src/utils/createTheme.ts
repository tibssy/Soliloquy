import { MD3DarkTheme, MD3LightTheme, MD3Theme } from "react-native-paper";
import {
    argbFromHex,
    themeFromSourceColor,
    hexFromArgb,
} from "@material/material-color-utilities";

export function createThemeFromSeed(
    sourceColor: string,
    isDark: boolean = false
): MD3Theme {
    const sourceColorArgb = argbFromHex(sourceColor);
    const theme = themeFromSourceColor(sourceColorArgb);
    const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
    const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

    return {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            primary: hexFromArgb(scheme.primary),
            onPrimary: hexFromArgb(scheme.onPrimary),
            primaryContainer: hexFromArgb(scheme.primaryContainer),
            onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),
            secondary: hexFromArgb(scheme.secondary),
            onSecondary: hexFromArgb(scheme.onSecondary),
            secondaryContainer: hexFromArgb(scheme.secondaryContainer),
            onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),
            tertiary: hexFromArgb(scheme.tertiary),
            onTertiary: hexFromArgb(scheme.onTertiary),
            tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
            onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),
            error: hexFromArgb(scheme.error),
            onError: hexFromArgb(scheme.onError),
            errorContainer: hexFromArgb(scheme.errorContainer),
            onErrorContainer: hexFromArgb(scheme.onErrorContainer),
            background: hexFromArgb(scheme.background),
            onBackground: hexFromArgb(scheme.onBackground),
            surface: hexFromArgb(scheme.surface),
            onSurface: hexFromArgb(scheme.onSurface),
            surfaceVariant: hexFromArgb(scheme.surfaceVariant),
            onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
            outline: hexFromArgb(scheme.outline),
            outlineVariant: hexFromArgb(scheme.outlineVariant),
            shadow: hexFromArgb(scheme.shadow),
            scrim: hexFromArgb(scheme.scrim),
            inverseSurface: hexFromArgb(scheme.inverseSurface),
            inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
            inversePrimary: hexFromArgb(scheme.inversePrimary),
            elevation: baseTheme.colors.elevation,
        },
    };
}
