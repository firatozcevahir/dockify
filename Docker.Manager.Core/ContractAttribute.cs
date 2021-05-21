using System;

namespace Docker.Manager.Core
{
    [AttributeUsage(AttributeTargets.All, AllowMultiple = true)]
    public class ContractAttribute : Attribute
    {
    }
}
