namespace NorthWind.Validation.Entities.Abstractions;
public abstract class AbstractViewModelValidator<DtoType, ViewModelType>(
    IModelValidatorHub<DtoType> dtoModelValidatorHub,
    ValidationConstraint constraint) : IModelValidator<ViewModelType>
{
    public ValidationConstraint Constraint => constraint;
    public IEnumerable<ValidationError> Errors => dtoModelValidatorHub.Errors;

    public virtual DtoType Cast(ViewModelType viewModel)
    {
        DtoType DtoModel = default;
        var ExplicitMethod = typeof(ViewModelType).GetMethod("op_Explicit");
        if (ExplicitMethod != null)
            DtoModel = (DtoType)ExplicitMethod.Invoke(viewModel, new object[] { viewModel });
        else
            throw new InvalidCastException();
        return DtoModel;
    }
    public Task<bool> Validate(ViewModelType model) =>
        dtoModelValidatorHub.Validate(Cast(model));
}
