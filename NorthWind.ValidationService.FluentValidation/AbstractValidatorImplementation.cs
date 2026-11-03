using FluentValidation;

namespace NorthWind.ValidationService.FluentValidation;
internal class AbstractValidatorImplementation<T> : AbstractValidator<T>
{
    public AbstractValidatorImplementation()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
    }
}
