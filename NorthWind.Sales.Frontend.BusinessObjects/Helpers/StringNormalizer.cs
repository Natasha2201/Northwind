using System;
using System.Text;

namespace NorthWind.Sales.Frontend.BusinessObjects.Helpers;

public static class StringNormalizer
{
    /// <summary>
    /// Elimina acentos (diacríticos), convierte a minúsculas y elimina espacios iniciales/finales.
    /// Ej: "Pérez" -> "perez", "Cámara" -> "camara"
    /// </summary>
    public static string Normalize(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        var lower = text.Trim().ToLowerInvariant();
        var sb = new StringBuilder(lower.Length);
        foreach (var ch in lower)
        {
            switch (ch)
            {
                case 'á': case 'à': case 'ä': case 'â': sb.Append('a'); break;
                case 'é': case 'è': case 'ë': case 'ê': sb.Append('e'); break;
                case 'í': case 'ì': case 'ï': case 'î': sb.Append('i'); break;
                case 'ó': case 'ò': case 'ö': case 'ô': sb.Append('o'); break;
                case 'ú': case 'ù': case 'ü': case 'û': sb.Append('u'); break;
                default: sb.Append(ch); break;
            }
        }
        return sb.ToString();
    }

    /// <summary>
    /// Comprueba si source empieza con prefix ignorando mayúsculas, minúsculas y acentos.
    /// </summary>
    public static bool StartsWithNormalized(string? source, string? prefix)
    {
        if (string.IsNullOrWhiteSpace(prefix)) return true;
        if (string.IsNullOrWhiteSpace(source)) return false;

        var normSource = Normalize(source);
        var normPrefix = Normalize(prefix);

        return normSource.StartsWith(normPrefix, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Comprueba si source contiene prefix ignorando mayúsculas, minúsculas y acentos.
    /// </summary>
    public static bool ContainsNormalized(string? source, string? prefix)
    {
        if (string.IsNullOrWhiteSpace(prefix)) return true;
        if (string.IsNullOrWhiteSpace(source)) return false;

        var normSource = Normalize(source);
        var normPrefix = Normalize(prefix);

        return normSource.Contains(normPrefix, StringComparison.OrdinalIgnoreCase);
    }
}
