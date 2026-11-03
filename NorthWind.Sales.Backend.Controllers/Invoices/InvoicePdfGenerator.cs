using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using NorthWind.Sales.Backend.BusinessObjects.ValueObjects;

namespace NorthWind.Sales.Backend.PdfGenerator;

public class InvoicePdfGenerator
{
    public byte[] Generate(InvoiceDto invoice)
    {
        // Color palette
        var primaryColor = "#111111";
        var accentColor = "#333333";
        var lightBg = "#f2f2f2";
        var borderColor = "#bdbdbd";
        var textMuted = "#555555";

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9.5f).FontColor("#111111"));

                // ===== HEADER =====
                page.Header().Column(headerCol =>
                {
                    headerCol.Item().Row(row =>
                    {
                        // Company info (Left)
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Row(r =>
                            {
                                r.AutoItem().Text("NORTH").FontSize(22).ExtraBold().FontColor(primaryColor);
                                r.AutoItem().Text("WIND").FontSize(22).ExtraBold().FontColor(accentColor);
                            });
                            col.Item().Text("Soluciones Comerciales & Distribución").FontSize(9).FontColor(textMuted);
                            col.Item().Text("RUC: 1792048956001").FontSize(8.5f).FontColor(textMuted);
                            col.Item().Text("Av. Amazonas N24-196 y Luis Cordero, Quito - Ecuador").FontSize(8.5f).FontColor(textMuted);
                            col.Item().Text("contacto@northwind.com | Telf: (02) 298-5400").FontSize(8.5f).FontColor(textMuted);
                        });

                        // Invoice badge / number (Right)
                        row.ConstantItem(240).Column(col =>
                        {
                            col.Item().Border(1).BorderColor(borderColor).Background(lightBg).Padding(8).Column(box =>
                            {
                                box.Item().AlignCenter().Text("FACTURA ELECTRÓNICA").FontSize(10).Bold().FontColor(primaryColor);
                                box.Item().AlignCenter().Text(invoice.InvoiceNumber).FontSize(14).ExtraBold().FontColor(accentColor);
                                box.Item().PaddingTop(4).AlignCenter().Text($"Fecha: {invoice.OrderDate:dd/MM/yyyy HH:mm}").FontSize(8.5f).FontColor(textMuted);
                                box.Item().AlignCenter().Text("AUTORIZACIÓN SRI").FontSize(7.5f).FontColor(textMuted);
                                box.Item().AlignCenter().Text("1810202601179204895600120010010000000131234567819").FontSize(5.5f).FontColor(textMuted);
                            });
                        });
                    });

                    headerCol.Item().PaddingTop(12).LineHorizontal(1.5f).LineColor(accentColor);
                });

                // ===== CONTENT =====
                page.Content().PaddingTop(12).Column(column =>
                {
                    // Customer & Shipping Info Box
                    column.Item().Border(1).BorderColor(borderColor).Background(lightBg).Padding(10).Row(row =>
                    {
                        // Client Details
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("DATOS DEL CLIENTE").FontSize(9).Bold().FontColor(primaryColor);
                            col.Item().PaddingTop(2).Row(r =>
                            {
                                r.ConstantItem(70).Text("Razón Social:").Bold().FontSize(8.5f);
                                r.RelativeItem().Text(invoice.CustomerName).FontSize(8.5f);
                            });
                            col.Item().Row(r =>
                            {
                                r.ConstantItem(70).Text("RUC / C.I.:").Bold().FontSize(8.5f);
                                r.RelativeItem().Text(invoice.CustomerIdentification).FontSize(8.5f);
                            });
                            if (!string.IsNullOrWhiteSpace(invoice.CustomerAddress))
                            {
                                col.Item().Row(r =>
                                {
                                    r.ConstantItem(70).Text("Dirección:").Bold().FontSize(8.5f);
                                    r.RelativeItem().Text(invoice.CustomerAddress).FontSize(8.5f);
                                });
                            }
                        });

                        // Shipping / Destination Details
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("DATOS DE ENTREGA").FontSize(9).Bold().FontColor(primaryColor);
                            col.Item().PaddingTop(2).Row(r =>
                            {
                                r.ConstantItem(70).Text("Dirección:").Bold().FontSize(8.5f);
                                r.RelativeItem().Text(string.IsNullOrWhiteSpace(invoice.ShipAddress) ? "Misma del cliente" : invoice.ShipAddress).FontSize(8.5f);
                            });
                            col.Item().Row(r =>
                            {
                                r.ConstantItem(70).Text("Ciudad/País:").Bold().FontSize(8.5f);
                                r.RelativeItem().Text($"{invoice.ShipCity}, {invoice.ShipCountry}").FontSize(8.5f);
                            });
                            if (!string.IsNullOrWhiteSpace(invoice.ShipPostalCode))
                            {
                                col.Item().Row(r =>
                                {
                                    r.ConstantItem(70).Text("Cód. Postal:").Bold().FontSize(8.5f);
                                    r.RelativeItem().Text(invoice.ShipPostalCode).FontSize(8.5f);
                                });
                            }
                        });
                    });

                    column.Item().PaddingTop(12);

                    // Products Table
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(65);   // ID / Código
                            columns.RelativeColumn(3);    // Descripción
                            columns.ConstantColumn(80);   // Precio Unit.
                            columns.ConstantColumn(60);   // Cantidad
                            columns.ConstantColumn(90);   // Subtotal
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(primaryColor).PaddingVertical(6).PaddingHorizontal(6).Text("CÓDIGO").Bold().FontColor("#ffffff").FontSize(8.5f);
                            header.Cell().Background(primaryColor).PaddingVertical(6).PaddingHorizontal(6).Text("DESCRIPCIÓN").Bold().FontColor("#ffffff").FontSize(8.5f);
                            header.Cell().Background(primaryColor).PaddingVertical(6).PaddingHorizontal(6).AlignRight().Text("PRECIO").Bold().FontColor("#ffffff").FontSize(8.5f);
                            header.Cell().Background(primaryColor).PaddingVertical(6).PaddingHorizontal(6).AlignCenter().Text("CANT.").Bold().FontColor("#ffffff").FontSize(8.5f);
                            header.Cell().Background(primaryColor).PaddingVertical(6).PaddingHorizontal(6).AlignRight().Text("TOTAL").Bold().FontColor("#ffffff").FontSize(8.5f);
                        });

                        var isEven = false;
                        foreach (var detail in invoice.Details)
                        {
                            var rowBg = isEven ? lightBg : "#ffffff";
                            isEven = !isEven;

                            table.Cell().Background(rowBg).BorderBottom(1).BorderColor(borderColor).PaddingVertical(6).PaddingHorizontal(6).Text(detail.ProductId.ToString()).FontSize(8.5f);
                            table.Cell().Background(rowBg).BorderBottom(1).BorderColor(borderColor).PaddingVertical(6).PaddingHorizontal(6).Text(detail.ProductName).Bold().FontSize(8.5f);
                            table.Cell().Background(rowBg).BorderBottom(1).BorderColor(borderColor).PaddingVertical(6).PaddingHorizontal(6).AlignRight().Text(detail.UnitPrice.ToString("C")).FontSize(8.5f);
                            table.Cell().Background(rowBg).BorderBottom(1).BorderColor(borderColor).PaddingVertical(6).PaddingHorizontal(6).AlignCenter().Text(detail.Quantity.ToString()).FontSize(8.5f);
                            table.Cell().Background(rowBg).BorderBottom(1).BorderColor(borderColor).PaddingVertical(6).PaddingHorizontal(6).AlignRight().Text(detail.Subtotal.ToString("C")).Bold().FontSize(8.5f);
                        }
                    });

                    column.Item().PaddingTop(12);

                    // Bottom Row: Payment & Notes (Left) + Totals Summary Box (Right)
                    column.Item().Row(row =>
                    {
                        // Notes & Payment terms
                        row.RelativeItem().Column(notesCol =>
                        {
                            notesCol.Item().Border(1).BorderColor(borderColor).Background(lightBg).Padding(8).Column(box =>
                            {
                                box.Item().Text("INFORMACIÓN ADICIONAL").FontSize(8.5f).Bold().FontColor(primaryColor);
                                box.Item().PaddingTop(3).Text("Forma de Pago: Efectivo").FontSize(8);
                                box.Item().Text("Documento emitido conforme a las regulaciones tributarias vigentes.").FontSize(7.5f).FontColor(textMuted);
                            });
                        });

                        row.ConstantItem(20); // Spacing

                        // Totals Summary Table Box
                        row.ConstantItem(220).Border(1).BorderColor(borderColor).Column(totalsCol =>
                        {
                            totalsCol.Item().PaddingVertical(4).PaddingHorizontal(8).Row(r =>
                            {
                                r.RelativeItem().Text("SUBTOTAL:").Bold().FontSize(8.5f).FontColor(primaryColor);
                                r.AutoItem().Text(invoice.Subtotal.ToString("C")).FontSize(8.5f);
                            });

                            totalsCol.Item().BorderTop(1).BorderColor(borderColor).PaddingVertical(4).PaddingHorizontal(8).Row(r =>
                            {
                                r.RelativeItem().Text("IVA (15%):").Bold().FontSize(8.5f).FontColor(primaryColor);
                                r.AutoItem().Text(invoice.Tax.ToString("C")).FontSize(8.5f);
                            });

                            totalsCol.Item().Background(primaryColor).PaddingVertical(6).PaddingHorizontal(8).Row(r =>
                            {
                                r.RelativeItem().Text("TOTAL A PAGAR:").ExtraBold().FontSize(10).FontColor("#ffffff");
                                r.AutoItem().Text(invoice.Total.ToString("C")).ExtraBold().FontSize(11).FontColor(accentColor);
                            });
                        });
                    });
                });

                // ===== FOOTER =====
                page.Footer().Column(col =>
                {
                    col.Item().LineHorizontal(1).LineColor(borderColor);
                    col.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem().Text("Gracias por confiar en NorthWind. ¡Esperamos servirle nuevamente!").FontSize(8).FontColor(textMuted).Italic();
                        row.AutoItem().Text(x =>
                        {
                            x.Span("Página ").FontSize(8).FontColor(textMuted);
                            x.CurrentPageNumber().FontSize(8).FontColor(textMuted);
                            x.Span(" de ").FontSize(8).FontColor(textMuted);
                            x.TotalPages().FontSize(8).FontColor(textMuted);
                        });
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
