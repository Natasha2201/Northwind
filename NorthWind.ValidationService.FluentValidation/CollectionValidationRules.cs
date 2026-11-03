namespace NorthWind.ValidationService.FluentValidation;
internal class CollectionValidationRules<T, TProperty>(
    IRuleBuilderInitialCollection<T, TProperty> ruleBuilderInitialCollection) : ICollectionValidationRules<T, TProperty>
{
    public ICollectionValidationRules<T, TProperty> SetValidator(IModelValidator<TProperty> modelValidator)
    {
        var ModelValidator = modelValidator as AbstractModelValidator<TProperty>;
        var ValidationService = ModelValidator.ValidatorService as FluentValidationService<TProperty>;
        ruleBuilderInitialCollection.SetValidator(ValidationService.Wrapper);
        return this;
    }
}
